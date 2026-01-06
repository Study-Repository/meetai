FROM python:3.12-slim

WORKDIR /app

# 安装 OpenCV 和系统库依赖
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY pyproject.toml .

# 安装依赖
# 注意：如果 [tool.uv.sources] 中的本地路径在 Docker 构建上下文中不存在，
# 这里可能会失败。建议使用 pip 安装发布的版本，或者将依赖库也 COPY 进来。
# 这里我们尝试忽略本地路径，直接安装（如果包在 PyPI 上可用）
RUN pip install .

# 复制其余代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令 (假设 main.py 已修改为暴露 'app' 对象)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]