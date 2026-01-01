# Makefile

# 获取本机 IP 地址 (尝试获取 en0 或 eth0 的 IPv4 地址)
# 如果自动获取失败，可以在命令行通过 HOST_IP=x.x.x.x make ... 手动指定
HOST_IP ?= $(shell ipconfig getifaddr en0 2>/dev/null || ip -4 addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n 1 2>/dev/null || echo "host.docker.internal")

# Docker Compose 文件路径
COMPOSE_FILE_VISION := docker-compose.yml
COMPOSE_FILE_INNGEST := docker-compose_inngest.yaml

# 默认目标
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make up              - Start all services (Vision Agent & Inngest)"
	@echo "  make down            - Stop all services"
	@echo "  make restart         - Restart all services"
	@echo "  make logs            - Follow logs for all services"
	@echo ""
	@echo "  make vision-up       - Start Vision Agent service only"
	@echo "  make vision-build    - Build Vision Agent service"
	@echo "  make vision-logs     - Logs for Vision Agent"
	@echo ""
	@echo "  make inngest-up      - Start Inngest service only"
	@echo "  make inngest-logs    - Logs for Inngest"
	@echo ""
	@echo "  Current HOST_IP: $(HOST_IP)"

# --- Global Commands ---

.PHONY: up
up: vision-up inngest-up
	@echo "All services started."

.PHONY: down
down:
	@echo "Stopping Vision Agent..."
	@docker compose -f $(COMPOSE_FILE_VISION) down
	@echo "Stopping Inngest..."
	@docker compose -f $(COMPOSE_FILE_INNGEST) down
	@echo "All services stopped."

.PHONY: restart
restart: down up

.PHONY: logs
logs:
	@echo "Streaming logs from all services..."
	@trap 'kill 0' INT; \
	docker compose -f $(COMPOSE_FILE_VISION) logs -f & \
	docker compose -f $(COMPOSE_FILE_INNGEST) logs -f & \
	wait

# --- Vision Agent Service ---

.PHONY: vision-up
vision-up:
	@echo "Starting Vision Agent with HOST_IP=$(HOST_IP)..."
	@HOST_IP=$(HOST_IP) docker compose -f $(COMPOSE_FILE_VISION) up -d

.PHONY: vision-build
vision-build:
	@echo "Building Vision Agent..."
	@docker compose -f $(COMPOSE_FILE_VISION) build

.PHONY: vision-logs
vision-logs:
	@docker compose -f $(COMPOSE_FILE_VISION) logs -f

# --- Inngest Service ---

.PHONY: inngest-up
inngest-up:
	@echo "Starting Inngest with HOST_IP=$(HOST_IP)..."
	@HOST_IP=$(HOST_IP) docker compose -f $(COMPOSE_FILE_INNGEST) up -d

.PHONY: inngest-logs
inngest-logs:
	@docker compose -f $(COMPOSE_FILE_INNGEST) logs -f
