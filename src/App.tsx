import { useState } from "react";
import { useDaily } from "@daily-co/daily-react";
import { ArrowRight, Ear, Loader2 } from "lucide-react";

import Session from "./components/Session";
import { Configure, RoomSetup } from "./components/Setup";
import { Alert } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { fetch_start_agent } from "./actions";

type State =
  | "idle"
  | "configuring"
  | "requesting_agent"
  | "connecting"
  | "connected"
  | "started"
  | "finished"
  | "error";

const status_text = {
  configuring: "Let's go!",
  requesting_agent: "Requesting agent...",
  requesting_token: "Requesting token...",
  connecting: "Connecting to room...",
};

// Server URL (ensure trailing slash)
let serverUrl: string = import.meta.env.VITE_SERVER_URL;
const serverAuth = import.meta.env.VITE_SERVER_AUTH;
if (serverUrl && !serverUrl.endsWith("/")) serverUrl += "/";

// Auto room creation (requires server URL)
const autoRoomCreation = import.meta.env.VITE_MANUAL_ROOM_ENTRY ? false : true;

// Query string for room URL
const roomQs = new URLSearchParams(window.location.search).get("room_url");
const checkRoomUrl = (url: string | null): boolean =>
  !!(url && /^(https?:\/\/[^.]+\.daily\.co\/[^/]+)$/.test(url));

// Show config options
const showConfigOptions = import.meta.env.VITE_SHOW_CONFIG;
const roomExpTimes = import.meta.env.VITE_ROOM_EXP_TIME_S || 1800;

// Mic mode
const isOpenMic = import.meta.env.VITE_OPEN_MIC ? true : false;

export default function App() {
  const daily = useDaily();

  const [state, setState] = useState<State>(
    showConfigOptions ? "idle" : "configuring"
  );
  const [error, setError] = useState<string | null>(null);
  const [startAudioOff, setStartAudioOff] = useState<boolean>(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(roomQs || null);
  const [roomError, setRoomError] = useState<boolean>(
    (roomQs && checkRoomUrl(roomQs)) || false
  );
  const [capacityError, setCapacityError] = useState<string>(""); // New state for start error

  function handleRoomUrl() {
    if ((autoRoomCreation && serverUrl) || checkRoomUrl(roomUrl)) {
      setRoomError(false);
      setState("configuring");
    } else {
      setRoomError(true);
    }
  }

  async function start() {
    if (!daily || (!roomUrl && !autoRoomCreation)) return;

    let res;

    // Request agent to start, or join room directly
    if (import.meta.env.VITE_SERVER_URL) {
      // Request a new agent to join the room
      setState("requesting_agent");

      const info = {
        config: {
          vad: {
            tag: "silero_vad_analyzer",
            args: { stop_secs: 0.7 },
          },
          asr: {
            tag: "deepgram_asr_processor",
            args: { language: "zh", model: "nova-2" },
          },
          llm: {
            base_url: "https://api.groq.com/openai/v1",
            model: "llama-3.1-70b-versatile",
            language: "zh",
            messages: [
              {
                role: "system",
                content:
                  "You are Andrej Karpathy, a Slovak-Canadian computer scientist who served as the director of artificial intelligence and Autopilot Vision at Tesla. \
    You co-founded and formerly worked at OpenAI, where you specialized in deep learning and computer vision. \
    You publish Youtube videos in which you explain complex machine learning concepts. \
    Your job is to help people with the content in your Youtube videos given context . \
    Keep your responses concise and relatively simple. \
    Ask for clarification if a user question is ambiguous. Be nice and helpful. Ensure responses contain only words. \
    Check again that you have not included special characters other than '?' or '!'. \
    Do not output in markdown format. Please communicate in Chinese",
              },
            ],
            tag: "openai_llm_processor",
          },
          tts: {
            tag: "tts_edge",
            args: {
              voice_name: "zh-CN-YunjianNeural",
              language: "zh",
              gender: "Male",
            },
          },
        },
      };

      try {
        res = await fetch_start_agent(
          `${serverUrl}create_random_room?exp_time_s=${roomExpTimes}`,
          serverAuth
        );
        if (res && !res.error_code) {
          let url = `${serverUrl}bot_join/${res.data.room.name}/DailyLangchainRAGBot`;
          let body = {};
          if (serverUrl.includes("api.cortex.cerebrium.ai")) {
            url = `${serverUrl}bot_join_room`;
            body = {
              info: info,
              room_name: res.data.room.name,
              chat_bot_name: "DailyLangchainRAGBot",
            };
          } else {
            body = info;
          }
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serverAuth}`,
            },
            body: JSON.stringify(body),
          }).catch((e) => {
            console.error(`Failed to make request to ${serverUrl}/main: ${e}`);
          });
        } else {
          setCapacityError(
            "We are currently at capacity for this demo. Please try again later."
          );
          setState("configuring");
          return;
          // setError(data.detail.message);
          // setState("error");
        }
      } catch (e) {
        console.log(e);
        setCapacityError(
          "We are currently at capacity for this demo. Please try again later."
        );
        setState("configuring");
        // setError(`Unable to connect to the bot server at '${serverUrl}'`);
        // setState("error");
        return;
      }
    }

    // Join the daily session, passing through the url and token
    setState("connecting");

    try {
      await daily.join({
        url: res.data.room.url || roomUrl,
        token: res.data.token || "",
        videoSource: false,
        startAudioOff: startAudioOff,
      });
    } catch (e) {
      setError(`Unable to join room:`);
      setState("error");
      return;
    }
    // Away we go...
    setState("connected");
  }

  async function leave() {
    await daily?.leave();
    await daily?.destroy();
    setState(showConfigOptions ? "idle" : "configuring");
  }

  if (state === "error") {
    return (
      <Alert intent="danger" title="An error occurred">
        {error}
      </Alert>
    );
  }

  if (state === "connected") {
    return (
      <Session
        onLeave={() => leave()}
        openMic={isOpenMic}
        startAudioOff={startAudioOff}
      />
    );
  }

  if (state !== "idle") {
    return (
      <Card shadow className="animate-appear max-w-lg">
        <CardHeader>
          <CardTitle>Configure your devices 配置</CardTitle>
          <CardDescription>
            Please configure your microphone and speakers below
            <br />
            在互联网良好的安静环境中效果最佳。
          </CardDescription>
        </CardHeader>
        <CardContent stack>
          <div className="flex flex-row gap-2 bg-primary-50 px-4 py-2 md:p-2 text-sm items-center justify-center rounded-md font-medium text-pretty">
            <Ear className="size-7 md:size-5 text-primary-400" />
            Works best in a quiet environment with a good internet.
            <br />
            在互联网良好的安静环境中效果最佳。
          </div>
          <Configure
            startAudioOff={startAudioOff}
            handleStartAudioOff={() => setStartAudioOff(!startAudioOff)}
          />
        </CardContent>
        <CardFooter>
          <Button
            key="start"
            fullWidthMobile
            onClick={() => start()}
            disabled={state !== "configuring"}
          >
            {state !== "configuring" && <Loader2 className="animate-spin" />}
            {status_text[state as keyof typeof status_text]}
          </Button>
        </CardFooter>
        {capacityError && (
          <div className="text-red-500 mt-2 p-4">{capacityError}</div>
        )}
      </Card>
    );
  }

  return (
    <Card shadow className="animate-appear max-w-lg">
      <CardHeader>
        <CardTitle>{import.meta.env.VITE_APP_TITLE}</CardTitle>
        <CardDescription>Check configuration below</CardDescription>
      </CardHeader>
      <CardContent stack>
        <RoomSetup
          serverUrl={serverUrl}
          roomQs={roomQs}
          roomQueryStringValid={checkRoomUrl(roomQs)}
          handleCheckRoomUrl={(url) => setRoomUrl(url)}
          roomError={roomError}
        />
      </CardContent>
      <CardFooter>
        <Button
          id="nextBtn"
          fullWidthMobile
          key="next"
          disabled={
            !!((roomQs && !roomError) || (autoRoomCreation && !serverUrl))
          }
          onClick={() => handleRoomUrl()}
        >
          Next <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}
