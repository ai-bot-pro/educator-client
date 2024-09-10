import React from "react";
import { Book, Rocket } from "lucide-react";

import { Button } from "./components/ui/button";

type SplashProps = {
  handleReady: () => void;
};

const Splash: React.FC<SplashProps> = ({ handleReady }) => {
  return (
    <main className="w-full h-full flex items-center justify-center bg-primary-200 p-4 bg-[length:auto_50%] lg:bg-auto bg-colorWash bg-no-repeat bg-right-top">
      <div className="flex flex-col gap-8 lg:gap-12 items-center max-w-full lg:max-w-3xl">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-balance">
          Andrej Karpathy视频内容提问Demo
        </h1>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-primary-400">
            Andrej Karpathy youtube video:
          </span>
          <div className="flex flex-row gap-6 bg-white rounded-full py-4 px-8 items-center">
            <a
              className="lg:text-lg text-primary-600"
              href="https://www.youtube.com/watch?v=zjkBMFhNj_g"
              target="_blank"
            >
              [1hr Talk] Intro to Large Language Models
            </a>
          </div>
          <div className="flex flex-row gap-6 bg-white rounded-full py-4 px-8 items-center">
            <a
              className="lg:text-lg text-primary-600"
              href="https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ"
              target="_blank"
            >
              Neural Networks: Zero to Hero
            </a>
          </div>
        </div>

        <div className="max-w-full lg:max-w-2xl flex flex-col gap-6 lg:text-lg text-primary-600">
          Educational resources are very digitized today, meaning anyone,
          anywhere can watch educational videos from some of the most renowned
          institutions and individuals in the world all from their laptop.
          However, one part of the process that has been lacking has been the
          ability to have your own personal tutor…until now.
          <br />
          <br />
          如今的教育资源已经高度数字化，这意味着任何人、任何地方都可以通过笔记本电脑观看来自世界上一些最著名的机构和个人的教育视频。然而，这一过程中一直缺乏的一部分是拥有自己的私人导师的能力……
          这个demo功能 是对 安德烈·卡帕蒂(Andrej Karpathy) 视频回放内容提问。
        </div>

        {/* TODO: Uncomment this line to implement yourself */}
        <Button onClick={handleReady}>Go to Demo</Button>

        <div className="h-[1px] bg-primary-300 w-full" />

        <footer className="flex flex-col lg:flex-row lg:gap-2">
          <Button variant="light" asChild>
            <a
              href="https://github.com/ai-bot-pro/achatbot/blob/main/src/cmd/bots/rag/daily_langchain_rag_bot.py"
              className="text-indigo-600"
            >
              <Book className="size-6" />
              View source code (源码)
            </a>
          </Button>
          <Button variant="light" asChild>
            <a
              href="https://github.com/ai-bot-pro/achatbot/tree/main/deploy"
              className="text-indigo-600"
            >
              <Rocket className="size-6" />
              Deploy your own (部署)
            </a>
          </Button>
        </footer>
      </div>
    </main>
  );
};

export default Splash;
