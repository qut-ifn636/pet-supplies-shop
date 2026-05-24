# Section 6 — Load Balancing & Load Testing

## Purpose

Demonstrate that the app is deployed across two EC2 instances behind an AWS Application Load Balancer, and that it handles increased load gracefully. Worth 6 marks — one of the highest-value new sections.

## Architecture

```
Internet
  → ALB (pet-supplies-shop-ALB-803410956.ap-southeast-2.elb.amazonaws.com)
    → Target Group: pet-supplies-shop-TG
      → EC2 Instance 1 (ec2-1) : port 80
      → EC2 Instance 2 (ec2-2) : port 80
```

The ALB distributes incoming HTTP requests across both instances using round-robin by default. Each EC2 runs identical code deployed by the CI/CD pipeline.

## Screenshots Required

| # | What | Where to find it |
|---|---|---|
| 6.1a | Both EC2 instances in **Running** state | EC2 Console → Instances |
| 6.1b | Target Group showing both instances **Healthy** | EC2 Console → Load Balancers → Target Groups → pet-supplies-shop-TG → Targets tab |
| 6.1c | ALB in **Active** state with DNS name visible | EC2 Console → Load Balancers |
| 6.1d | Traffic alternating between instances | Terminal: 20x `curl http://<ALB-DNS>/api/health` showing `ec2-1`/`ec2-2` alternating in the `instance` field |
| 6.2a | Baseline `ab` test output | Terminal screenshot |
| 6.2b | High-concurrency `ab` test output | Terminal screenshot |
| 6.2c | CloudWatch CPU utilisation spike during load test | CloudWatch → Metrics → EC2 → Per-Instance → CPUUtilization |
| 6.2d | Written analysis | In the report body |

## Load Test Commands

### Baseline
```bash
ab -n 1000 -c 10 http://pet-supplies-shop-ALB-803410956.ap-southeast-2.elb.amazonaws.com/api/health
```

### High Concurrency
```bash
ab -n 5000 -c 100 http://pet-supplies-shop-ALB-803410956.ap-southeast-2.elb.amazonaws.com/api/health
```

## Confirming Traffic Distribution (6.1d)

Run this in WSL2 or a terminal:
```bash
for i in $(seq 1 20); do
  curl -s http://pet-supplies-shop-ALB-803410956.ap-southeast-2.elb.amazonaws.com/api/health | python3 -c "import sys,json; print(json.load(sys.stdin)['instance'])"
done
```

You should see `ec2-1` and `ec2-2` alternating. Screenshot the terminal output.

## Load Test Results (Reference)

| Metric | Baseline (1 000 req, c=10) | High load (5 000 req, c=100) |
|---|---|---|
| Requests/sec | ~467 | ~205 |
| Mean time/req | ~21 ms | ~487 ms |
| p99 latency | low | ~16 000 ms |
| Failed requests | 0 | 0 |

## Written Analysis for the Report

### 6.2b — Comparison paragraph

> The high-concurrency test (5 000 requests, 100 concurrent) produced roughly 205 requests per second compared to 467 in the baseline (1 000 requests, 10 concurrent). Mean response time increased from ~21 ms to ~487 ms. No requests failed in either test, showing the system remained stable under the heavier load.

### 6.2d — Analysis paragraph

> The Application Load Balancer distributed traffic across both EC2 instances throughout both tests, as confirmed by the alternating `ec2-1`/`ec2-2` responses in the health endpoint. At 10 concurrent users the system handled requests with sub-25 ms mean latency and no failures, demonstrating comfortable headroom. Under 100 concurrent users, throughput roughly halved and mean latency increased ~23×, reflecting the single-core nature of the `t2.micro` instances rather than any ALB bottleneck — the load balancer itself remained healthy throughout. CloudWatch confirmed CPU spiked on both instances during the high-concurrency run and returned to baseline immediately after. The ALB architecture improves both reliability (a single instance failure does not take the site down) and horizontal scalability (adding a third instance requires only registering it in the target group, with no code changes).

## Key Talking Points for the Demo

- "The ALB uses round-robin by default, so consecutive requests go to ec2-1 then ec2-2 alternately. You can see this in the `instance` field of the health endpoint."
- "Both targets must show **Healthy** in the target group, not just Registered. Unhealthy means the health check is failing — the ALB stops sending traffic to that instance."
- "We ran two `ab` tests with different parameters to compare. The baseline was low concurrency to establish normal performance; the second test ramped up to 100 concurrent users to see how it scales."
- "No requests failed in either test, which shows the system is stable under this load. The latency increase at higher concurrency is expected on `t2.micro` instances."
- "The ALB DNS stays stable even when EC2 IPs change after a restart, which is why we use it as the public URL rather than an instance IP."

## CloudWatch Steps (if you need to re-capture)

1. Open AWS CloudWatch → Metrics → EC2 → Per-Instance Metrics
2. Select `CPUUtilization` for both instance IDs
3. Set the time window to cover when you ran the `ab` tests
4. Screenshot the graph showing the CPU spike during the load test period
