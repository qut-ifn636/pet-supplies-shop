# Assignment Evidence Checklist

## 6.1 Load Balancer Setup

- [ ] **(a)** Screenshot — both EC2 instances in **Running** state (AWS EC2 Instances console)
  > Take this now before continuing

- [ ] **(b)** Screenshot — Target Group `petopia-targets` showing both instances registered with **Status: healthy**
  > Take after Task 6b (target group) + ALB creation, once health checks pass

- [ ] **(c)** Screenshot — Application Load Balancer `petopia-alb` in **Active** state, showing its DNS name
  > Take after Task 6c (ALB creation)

- [ ] **(d)** Screenshot — Traffic distribution proof: curl or browser responses alternating between `ec2-1` and `ec2-2`
  > Take after ALB is active. Run: `for i in $(seq 1 20); do curl -s http://<ALB-DNS>/api/health; echo; done`

---

## 6.2 Load Testing and Performance Analysis

> **Tool required: Apache Benchmark (`ab`)** — not Artillery
> Install on EC2-1: `sudo apt-get install -y apache2-utils`

- [ ] **(a)** Screenshot — Apache Benchmark **baseline test** output
  > Suggested: `ab -n 1000 -c 50 http://<ALB-DNS>/api/health`
  > Capture: Requests per second, Time per request, Failed requests

- [ ] **(b)** Screenshot — Apache Benchmark **second test** with higher concurrency/requests
  > Suggested: `ab -n 5000 -c 200 http://<ALB-DNS>/api/health`
  > Compare results with baseline

- [ ] **(c)** Screenshot — CloudWatch Metrics showing **CPU utilisation spike** during load testing
  > AWS Console → CloudWatch → EC2 → Per-Instance Metrics → CPUUtilization (both instances)
  > Also capture: ALB RequestCount per target (proves distribution)

- [ ] **(d)** Written analysis (3–5 sentences)
  > Cover: how ALB distributed traffic, how system responded to increased load,
  > application reliability and cost-effectiveness in a cloud environment

---

## Notes

- ALB DNS name: `http://pet-supplies-shop-ALB-803410956.ap-southeast-2.elb.amazonaws.com`
- EC2-1 public IP: *(fill in)*
- EC2-2 public IP: *(fill in)*
