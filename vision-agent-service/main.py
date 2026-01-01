import logging
import os
from dotenv import load_dotenv
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel

from vision_agents.core import User, Agent
from vision_agents.plugins import getstream, ultralytics, gemini

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

class JoinCallRequest(BaseModel):
    call_id: str
    call_type: str = "default"
    agent_id: str
    agent_name: str = "AI Golf Coach"
    instructions: str = "Read @golf_coach.md" # 默认指令，也可以从 Next.js 传入

async def create_agent(agent_id: str, name: str, instructions: str) -> Agent:
    # 显式生成一个 user_id，确保 ID 不为空
    # 格式建议保持简单，避免特殊字符
    agent = Agent(
        edge=getstream.Edge(),
        agent_user=User(id=agent_id, name=name),
        instructions=instructions,
        llm=gemini.Realtime(fps=3),
        # 关键点 1：将 processors 设置为空列表，或者直接去掉这个参数
        # 如果你保留 YOLOPoseProcessor，Agent 可能会尝试从视频流中处理并反推视频
        # processors=[
        #     ultralytics.YOLOPoseProcessor(model_path="yolo11n-pose.pt")
        # ],
    )
    return agent

async def run_agent_in_background(call_type: str, call_id: str, agent_id: str, name: str, instructions: str):
    """后台任务：创建 Agent 并加入通话"""
    try:
        logger.info(f"Starting agent {name} for call {call_type}:{call_id}")
        agent = await create_agent(agent_id, name, instructions)
        
        # 创建并加入通话
        call = await agent.create_call(call_type, call_id)
        
        with await agent.join(call):
            logger.info(f"Agent {name} joined call {call_id}")
            await agent.llm.simple_response(
                text="Hello, I am your AI coach. I'm ready to analyze your swing."
            )
            # 保持运行直到通话结束
            await agent.finish()
            
        logger.info(f"Agent {name} finished call {call_id}")
    except Exception as e:
        logger.error(f"Error in agent process: {e}", exc_info=True)

@app.post("/join-call")
async def join_call_endpoint(request: JoinCallRequest, background_tasks: BackgroundTasks):
    """Next.js Webhook 将调用此接口"""
    background_tasks.add_task(
        run_agent_in_background, 
        request.call_type, 
        request.call_id,
        request.agent_id,
        request.agent_name,
        request.instructions
    )
    return {"status": "processing", "message": f"Agent joining call {request.call_id}"}

if __name__ == "__main__":
    import uvicorn
    # 本地开发运行在 8000 端口
    uvicorn.run(app, host="0.0.0.0", port=8000)