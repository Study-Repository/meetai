export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 动态导入，避免在非 Node 环境下报错
    const { setGlobalDispatcher, ProxyAgent } = await import('undici');

    // 检查环境变量中是否有代理设置
    const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

    if (proxyUrl) {
      console.log(`>>> [Instrumentation] Setting global proxy to ${proxyUrl}`);

      const dispatcher = new ProxyAgent(proxyUrl);
      setGlobalDispatcher(dispatcher);
    }
  }
}
