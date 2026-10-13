import { BlogPost } from "@/types/blog";

export const POSTS: BlogPost[] = [
  {
    slug: "building-distributed-raft-kv-go",
    title: "Demystifying Raft: Building a Zero-Allocation Consensus Engine in Go",
    description:
      "A deep dive into building a high-throughput distributed key-value store with the Raft consensus algorithm, exploring log replication, ReadIndex leases, and zero-allocation networking in Go.",
    publishedAt: "2025-02-18",
    readingTime: "9 min read",
    category: "Distributed Systems",
    tags: ["Go", "Raft", "Distributed Systems", "Concurrency", "Performance"],
    author: {
      name: "Jurek",
      handle: "@jurek-zsl",
    },
    toc: [
      { id: "introduction", text: "Introduction & Motivation", level: 2 },
      { id: "consensus-overview", text: "Why Raft over Paxos?", level: 2 },
      { id: "log-replication-engine", text: "The Log Replication Engine", level: 2 },
      { id: "read-index-optimization", text: "Linearizable Reads without Write Quorum", level: 3 },
      { id: "memory-optimizations", text: "Zero-Allocation Buffer Pools in Go", level: 2 },
      { id: "benchmarks-learnings", text: "Benchmarking & Production Lessons", level: 2 },
    ],
    content: `
Consensus algorithms are notoriously tricky to implement correctly. While Diego Ongaro and John Ousterhout designed Raft explicitly for understandability, translating formal TLA+ specifications into production-grade Go code involves practical trade-offs around memory allocation, network latency, and disk I/O bottlenecks.

In this article, I share the architectural decisions behind **RaftKV-Go**, a zero-allocation distributed key-value engine built in Go, and how we achieved sub-2ms p99 latency across a 5-node cluster.

---

## Why Raft over Paxos?

Multi-Paxos splits responsibility across proposer, acceptor, and learner roles, which allows for symmetric peer participation but introduces significant complexity when dealing with log compaction and membership reconfiguration.

Raft decomposes consensus into three independent sub-problems:
1. **Leader Election:** A single leader handles all client writes.
2. **Log Replication:** The leader appends entries and replicates them across followers.
3. **Safety:** If any server has applied an entry to its state machine, no other server may apply a different command for the same log index.

By making the leader the sole authority on log ordering, Raft streamlines the critical path. Followers only need to compare term numbers and log indices.

---

## The Log Replication Engine

The core replication loop in Go relies on an event-driven actor model. Rather than spawning an unbounded number of goroutines per heartbeat, each peer is represented by a dedicated connection worker holding a bounded channel:

\`\`\`go
type PeerWorker struct {
    peerID     uint64
    nextIndex  uint64
    matchIndex uint64
    outbox     chan *ReplicationBatch
    stopCh     chan struct{}
}

func (w *PeerWorker) Run(ctx context.Context, transport Transport) {
    for {
        select {
        case <-ctx.Done():
            return
        case batch := <-w.outbox:
            resp, err := transport.SendAppendEntries(ctx, w.peerID, batch)
            if err != nil {
                w.handleTransportError(err)
                continue
            }
            w.processResponse(resp)
        }
    }
}
\`\`\`

### Linearizable Reads without Write Quorum

In naive Raft, satisfying a read request requires appending a no-op log entry through the full consensus pipeline, triggering disk WAL flushes and network rounds. This degrades read throughput significantly.

We solved this using the **ReadIndex** protocol:
1. The leader records its current \`commitIndex\` as \`readIndex\`.
2. The leader broadcasts a minimal heartbeat round to verify it has not been deposed by a split-brain leader.
3. Once a majority acknowledges the heartbeat, the leader waits until its local state machine applies up to \`readIndex\`, then immediately serves the read from memory.

\`\`\`go
// ReadIndex executes a linearizable read without disk write
func (n *RaftNode) LinearizableRead(ctx context.Context, key []byte) ([]byte, error) {
    readIndex, err := n.acquireReadIndex(ctx)
    if err != nil {
        return nil, fmt.Errorf("read lease failed: %w", err)
    }

    // Wait until local state machine catches up to readIndex
    if err := n.stateMachine.WaitApplied(ctx, readIndex); err != nil {
        return nil, err
    }

    return n.storage.Get(key)
}
\`\`\`

---

## Zero-Allocation Buffer Pools in Go

At 85,000 QPS, Go's garbage collector can trigger noticeable Stop-The-World (STW) pauses if every RPC payload allocates a new slice on the heap. We implemented synchronized byte buffer pools using \`sync.Pool\` and segmented ring buffers:

\`\`\`go
var bufferPool = sync.Pool{
    New: func() any {
        buf := make([]byte, 0, 64*1024) // 64KB slabs
        return &buf
    },
}

func acquireBuffer() *[]byte {
    return bufferPool.Get().(*[]byte)
}

func releaseBuffer(b *[]byte) {
    *b = (*b)[:0]
    bufferPool.Put(b)
}
\`\`\`

By recycling buffers across the network deserialization boundary, we reduced garbage collector overhead from 14% CPU time down to 1.8%, cutting p99 tail latency in half.

---

## Benchmarking & Production Lessons

We stress-tested the cluster with a 5-node deployment across three availability zones. Using a concurrent benchmark harness simulating 500 parallel client workers:

| Metric | Naive Raft | RaftKV-Go (ReadIndex + BufferPool) | Improvement |
| :--- | :--- | :--- | :--- |
| **Write QPS** | 22,400 | 41,200 | **+84%** |
| **Read QPS** | 18,100 | 85,600 | **+372%** |
| **p99 Latency** | 12.4 ms | 1.84 ms | **-85%** |
| **GC Pause** | 8.2 ms | 0.9 ms | **-89%** |

### Key Takeaways
1. **Never allocate in the hot path:** Memory recycling beats GC tuning every single time.
2. **ReadIndex is essential:** Reading without log writes is the single most impactful optimization in Raft.
3. **Use bounded ring buffers:** Unbounded channels under high traffic lead to catastrophic memory exhaustion.
`,
  },
  {
    slug: "linux-io-uring-high-throughput-networking",
    title: "From epoll to io_uring: Achieving 10M Requests/sec on Modern Linux",
    description:
      "A deep technical exploration comparing Linux epoll and io_uring, examining kernel submission and completion queues, registered buffers, and zero-syscall event loops.",
    publishedAt: "2025-01-30",
    readingTime: "11 min read",
    category: "Linux & Kernel",
    tags: ["Linux", "Kernel", "io_uring", "epoll", "C", "Networking"],
    author: {
      name: "Jurek",
      handle: "@jurek-zsl",
    },
    toc: [
      { id: "context", text: "The Bottleneck of Syscall Context Switches", level: 2 },
      { id: "ring-architecture", text: "The io_uring Ring Architecture", level: 2 },
      { id: "submission-completion", text: "Submission & Completion Queues", level: 3 },
      { id: "sqpoll-zero-syscalls", text: "SQPOLL: True Zero-Syscall I/O", level: 2 },
      { id: "registered-buffers", text: "Fixed Buffers & Page Pinning", level: 2 },
      { id: "real-world-metrics", text: "Comparative Benchmark Results", level: 2 },
    ],
    content: `
For over two decades, \`epoll\` has been the bedrock of high-performance network programming on Linux. Web servers like Nginx, Node.js (via libuv), and Envoy all rely on epoll readiness notifications to multiplex thousands of TCP connections over a handful of worker threads.

However, as network hardware evolved from 1GbE to 100GbE and NVMe SSDs reached millions of IOPS, the overhead of standard Linux system calls (\`read\`, \`write\`, \`epoll_wait\`) became the primary bottleneck.

Enter **io_uring**, introduced by Jens Axboe in Linux 5.1.

---

## The Bottleneck of Syscall Context Switches

When an application invokes \`read()\` or \`write()\`:
1. The CPU transitions from User Mode (Ring 3) to Kernel Mode (Ring 0).
2. Registers are saved to the kernel stack.
3. Page tables may need flushing due to Meltdown/Spectre mitigations (KPTI).
4. After copying data, the CPU transitions back to User Mode.

At 100,000 requests per second, context switching consumes measurable CPU cycles. At 1,000,000+ requests per second, context switching accounts for over 60% of total CPU time.

---

## The io_uring Ring Architecture

Instead of issuing synchronous or readiness-based syscalls, \`io_uring\` establishes two circular ring buffers mapped into shared memory between kernel and userspace:
- **Submission Queue (SQ):** The application produces I/O requests (SQEs).
- **Completion Queue (CQ):** The kernel posts completed results (CQEs).

\`\`\`c
struct io_uring ring;
struct io_uring_params params;
memset(&params, 0, sizeof(params));

// Initialize ring with 4096 queue depth
int ret = io_uring_queue_init_params(4096, &ring, &params);
if (ret < 0) {
    perror("io_uring_queue_init_params failed");
    exit(1);
}
\`\`\`

### Submission & Completion Queues

Submitting a batch of 128 socket reads requires zero syscalls per request:

\`\`\`c
struct io_uring_sqe *sqe = io_uring_get_sqe(&ring);
io_uring_prep_recv(sqe, client_fd, buf, BUF_SIZE, 0);
sqe->user_data = client_fd;

// Submit entire batch with a single syscall
io_uring_submit(&ring);
\`\`\`

---

## SQPOLL: True Zero-Syscall I/O

When initializing \`io_uring\` with the \`IORING_SETUP_SQPOLL\` flag, the kernel spawns a dedicated kernel thread that continuously polls the Submission Queue ring.

When you add an SQE to the ring, the kernel thread picks it up immediately. **Zero system calls are executed by the application during normal operations.**

\`\`\`c
params.flags = IORING_SETUP_SQPOLL;
params.sq_thread_idle = 2000; // sleep after 2000ms idle
io_uring_queue_init_params(4096, &ring, &params);
\`\`\`

---

## Fixed Buffers & Page Pinning

In traditional I/O, every read/write requires the kernel to pin userspace pages in memory and create temporary scatter-gather DMA mappings.

With \`io_uring_register_buffers()\`, you register a contiguous memory arena upfront:

\`\`\`c
struct iovec iov[MAX_BUFFERS];
for (int i = 0; i < MAX_BUFFERS; i++) {
    iov[i].iov_base = malloc(BUFFER_SIZE);
    iov[i].iov_len = BUFFER_SIZE;
}

// Register fixed buffers with the kernel once
io_uring_register_buffers(&ring, iov, MAX_BUFFERS);
\`\`\`

Now, subsequent socket operations use \`io_uring_prep_read_fixed()\` or \`io_uring_prep_write_fixed()\`, bypassing all page table translation and mapping overhead.

---

## Comparative Benchmark Results

Running our open-source benchmark suite on a 64-core AMD EPYC server equipped with a Mellanox ConnectX-6 100GbE NIC:

\`\`\`
epoll (4 worker threads):       1,240,000 req/s  (p99: 2.41ms)
io_uring standard (batched):    4,890,000 req/s  (p99: 0.94ms)
io_uring SQPOLL + Fixed Buffers: 10,250,000 req/s (p99: 0.32ms)
\`\`\`

The result is clear: by removing system calls and memory re-mapping from the execution loop, \`io_uring\` represents the most significant leap in Linux server performance in two decades.
`,
  },
  {
    slug: "crafting-high-performance-micro-interactions-nextjs",
    title: "Fluid Spring Physics & Micro-Interactions in Modern React & Next.js",
    description:
      "How to build tactile, organic interfaces with Motion (motion.dev), spring physics, 3D spotlight card tilts, and zero-jank layout transitions in Next.js 15.",
    publishedAt: "2025-01-12",
    readingTime: "7 min read",
    category: "Web Architecture",
    tags: ["React 19", "Next.js 15", "Motion", "Tailwind CSS", "UI/UX", "CSS"],
    author: {
      name: "Jurek",
      handle: "@jurek-zsl",
    },
    toc: [
      { id: "philosophy", text: "The Physics of Good UI", level: 2 },
      { id: "spring-parameters", text: "Tuning Spring Stiffness & Damping", level: 2 },
      { id: "cursor-spotlight", text: "Mouse-Tracking Spotlight Borders", level: 2 },
      { id: "layout-id-transitions", text: "Shared Element Transitions with layoutId", level: 2 },
      { id: "accessibility-reduced-motion", text: "Respecting Reduced Motion Preferences", level: 2 },
    ],
    content: `
Static interfaces feel like dead documents. But excessive or linear animations feel sluggish, artificial, and frustrating. The secret to modern neo-minimalist interfaces is tactile reactivity: components that respond immediately with organic spring physics.

When an interaction behaves like real physical matter—reacting to momentum, decelerating with natural friction, and snapping into place—the brain processes the interface with zero cognitive friction.

---

## The Physics of Good UI

Traditional CSS transitions rely on cubic-bezier timing functions (\`ease-in-out\`, \`ease-out\`). The fundamental flaw with duration-based easing is that when a user interrupts an ongoing animation (e.g., hovering in and out rapidly), duration-based animations stutter, reverse artificially, or reset abruptly.

Spring physics solve this by modeling real-world forces:
- **Mass:** How heavy the object feels.
- **Stiffness:** How strong the pull towards the target is.
- **Damping:** How quickly oscillations dissipate into stillness.

\`\`\`tsx
// Golden ratio spring config for snappy, organic UI feedback
const springTransition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};
\`\`\`

---

## Mouse-Tracking Spotlight Borders

One of the most satisfying accents in neo-minimalist dark designs is the spotlight border effect: a subtle radial gradient that follows the user's cursor across cards, illuminating borders and surfaces as if a light source is skimming the glass.

Here is how to implement this cleanly in React with CSS variables and minimal re-renders:

\`\`\`tsx
"use client";

import React, { useRef } from "react";

export function SpotlightCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty("--mouse-x", \`\${x}px\`);
    cardRef.current.style.setProperty("--mouse-y", \`\${y}px\`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="relative rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 overflow-hidden group"
    >
      {/* Radial spotlight overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: \`radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(139, 92, 246, 0.15), transparent 40%)\`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
\`\`\`

---

## Shared Element Transitions with layoutId

In Next.js App Router, navigating between list views and detail views often causes harsh visual jumps. Using \`motion\`'s \`layoutId\`, items seamlessly morph from a compact list card into a full-screen or expanded modal sheet:

\`\`\`tsx
import { motion, AnimatePresence } from "motion/react";

export function ActiveCategoryIndicator({ activeTab }: { activeTab: string }) {
  return (
    <div className="flex gap-2">
      {["All", "Systems", "Fullstack"].map((tab) => (
        <button key={tab} className="relative px-4 py-2 text-sm text-zinc-300">
          {tab}
          {activeTab === tab && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 -z-10 rounded-full bg-violet-600/20 border border-violet-500/40"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
\`\`\`

---

## Respecting Reduced Motion Preferences

Accessibility must never be an afterthought. Users prone to vestibular motion sickness configure their operating systems to minimize non-essential animations.

Always use \`useReducedMotion\` from \`motion/react\`:

\`\`\`tsx
import { useReducedMotion } from "motion/react";

export function FadeUpSection({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  const animationProps = shouldReduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { type: "spring", stiffness: 260, damping: 20 },
      };

  return <motion.div {...animationProps}>{children}</motion.div>;
}
\`\`\`

By pairing restrained physics curves with strict accessibility defaults, your interface feels fast, responsive, and comfortable over hours of daily use.
`,
  },
];
