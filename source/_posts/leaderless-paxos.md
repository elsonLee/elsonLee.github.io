---
title: Leaderless multi-Paxos Replicated State Machine
date: 2019-02-13 22:33:19
tags:
---

##  从single instance到multi instance
如果把对一个值的共识确定过程称为一个paxos instance，那么一个基于paxos的replicated state machine实现，其log的每个index都对应一个paxos instance。不同的server同时既是提议者，又是接收者和学习者，每个client可以并行地通过任意server发送指令，而每个server的state machine log的某一个index内容由paxos instance达成共识。

### 并发的可行性分析
支持client并行发送指令，如果指令之间是concurrent关系，那么为某个指令选择的log index大小并没有关系，然而，如果指令之间有external causality关系，必须要保证log index顺序的一致。

假设指令A和B，满足A $\rightarrow$ B。那么，**client在完成指令A后，须确保指令A已经选中（达成Quorum，并且都已持久化，下文改称commit）**，之后才能请求处理指令B，这样，指令A和B在paxos内部来看能够满足：{指令A commit} $\rightarrow$ {指令B request}，那么只要保证在为新指令选择log index的时候，**{新指令的log index} > {已commit entry中最大的log index}**，即能保证log index顺序一致。

### Log Index的选择
根据以上关于并发的可行性分析结论，要满足log index顺序的一致性，可以在先向接收者们查询已commit entry中最大的log index，得到某多数集合回复后，取其中最大的log index + 1作为本次log index的选择（Quorum原则保证了任意多数集合中一定存在所有接收者中已commit entry中最大的log index）。

多个server可能提出具有相同log index的不同提议，这个并没有关系，相当于针对某个paxos instance进行一次普通的“共识竞争”，只要确保所有对于该paxos instance的提议ID都全局唯一即可。

### 提议ID的选择
在前文[basic paxos中对提议ID的要求](https://elsonlee.github.io/2019/02/12/revisit-basic-paxos/#%E5%AF%B9%E6%8F%90%E8%AE%AEID%E7%9A%84%E8%A6%81%E6%B1%82)中已说明对single paxos来说需要保证提议ID全局唯一（硬性条件），全局单调递增（软性条件）。现在在multi paxos instances中，其实可以把每个instance都堪称独立的，不同的instance完全可以用到相同的提议ID，只要做到每个instance可见的提议ID都是相互不同又单调递增的即可。处于实现的方便，用一个统一的、全局唯一、单调递增的ID生成方式完全也是可以满足每个paxos instance的要求的。例如：使用server timestamp + ip作为提议ID（只要保证在时钟最小单位内最多只有一个提议，就可以保证唯一，虽然只能保证基本全局单调递增，但这个并不会破坏正确性）。

### 发起single paxos
在确定了当前Log Index和提议ID后，就可以对该index发起一轮paxos。由于每个paxos instance是独立的，因此需要独立记录变量$minProposal$、$acceptedProposal$以及$acceptedValue$（每个server可以用一个数组记录所有index对应的paxos状态），并且，如同single paxos那样，接收者在回复预提议前要对$minProposal$做持久化（如果被修改），接收者在接受新的提议并回复前要对$acceptedProposal$和$acceptedValue$做持久化（如果被修改，这也意味着只要提议者确认Quorum达成，当前指令必然已在多数server上完成持久化工作）。

### 预提议返回$acceptedValue$
在single paxos中，预提议如果返回$acceptedValue$而非$noAcceptedValue$，可能有两种可能，一种是之前在该log index上已达成Quorum，返回的是已commit的值，另一种可能是少数集合接受了值，未达成Quorum，返回的是未commit的值。这两种情况对于提议者来说是无法分辨的（[basic paxos中预提议结果无法判断是否达成共识的问题](https://elsonlee.github.io/2019/02/12/revisit-basic-paxos/#%E9%A2%84%E6%8F%90%E8%AE%AE%E7%BB%93%E6%9E%9C%E6%97%A0%E6%B3%95%E5%88%A4%E6%96%AD%E6%98%AF%E5%90%A6%E8%BE%BE%E6%88%90%E5%85%B1%E8%AF%86%E7%9A%84%E9%97%AE%E9%A2%98)）。实际上，即便log index选择时能保证没有在该log index上达成Quorum（如果达成，就不可能选择该log index），但是无法保证发起预提议的时候没有通过其他server达成Quorum（log index选择和预提议之间并不是原子的），所以，两种情况都会发生。**对于收到任何携带$acceptedValue$的预提议回复（收到的回复总数需满足Quorum）的提议者来说，由于无法区别上述两种情况，只能认为该log index已经提交并直接停止本轮paxos的后续流程，重新选择log index，发起新一轮paxos**。如果收到的预提议回复都携带$noAcceptedValue$，就可以对该log index进行正式的提议流程（不会有竞争关系）。

### 正式提议与client的处理逻辑
接收者在收到正式提议后根据single paxos的要求处理并给提议者回复（包括拒绝的情况），这里有三种情况：
>如果提议者收到多数集合接受提议，让client回复success
>如果提议者收到多数集合拒绝提议，提议者重新选择log index，发起新一轮paxos，或者让client回复fail
>如果提议者收到部分回复（ie. 接收者可能crash），无法判断该指令是否被commit了，让client回复unknown

### Unknown的处理
Unknown的情况可能是某接收者在提议者发起正式提议时crash了，可能在crash之前已经做了持久化，也可能没做持久化，因此是否commit情况未知。这种情况下，client可以对该log index发起一轮新的paxos，也分三种情况：
>如果接收者重启完成并在之前成功做了持久化，那么这轮paxos在预提议阶段学习到的值就一定是已经commit了的值
>如果预提议返回的都是$noacceptedValue$回复，重新针对该log index发起新一轮paxos
>如果只是少数集合接受了提议，那么新的一轮paxos中，预提议学习到的可能是个uncommitted值，

### 无效的log entry

参考资料：
[1] Lamport, L. 2001. Paxos made simple.
[2] John Ousterhout and Diego Ongaro. 2013. Implementing Replicated Logs with Paxos.
[3] 郁白. 2015. 使用Basic-Paxos协议的日志同步与恢复.