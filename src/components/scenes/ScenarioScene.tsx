import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ScenarioIcon } from "../icons/CyberSecurityIcons";
import { VideoPlayer } from "../VideoPlayer";
export interface TranscriptRow {
  start: number;
  text: string;
}

// Enhanced video data with multi-language transcript support
function parseTactiqTranscript(raw: string): TranscriptRow[] {
  const lines = raw.split("\n");
  const transcript: TranscriptRow[] = [];
  for (const line of lines) {
    const match = line.match(
      /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+(.+)$/,
    );
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const s = parseInt(match[3], 10);
      const ms = parseInt(match[4], 10);
      const start = h * 3600 + m * 60 + s + ms / 1000;
      transcript.push({ start, text: match[5] });
    }
  }
  return transcript;
}

export function ScenarioScene() {
  const tactiqRaw = `00:00:01.040 as a devops manager my job is hectic and
00:00:04.400 security is always a top priority but an
00:00:07.919 experience I had last month made me
00:00:10.400 change my behavior one day during my
00:00:13.120 lunch break I received an email that
00:00:15.639 looked like it was from the finance
00:00:17.439 department it asked me to approve an
00:00:20.039 invoice something felt off the invoice
00:00:23.320 number was strange and there were a few
00:00:25.519 grammar mistakes thanks to my cyber
00:00:28.279 security training I quickly realized it
00:00:30.679 was a fishing attempt I thought someone
00:00:33.879 might fall for this but instead of
00:00:36.239 reporting it I moved on with my work
00:00:38.760 assuming it will catch it anyway a week
00:00:42.079 later our company announced a fishing
00:00:44.840 attack has led to a data breach exposing
00:00:47.680 customer
00:00:48.800 information the email I had ignored was
00:00:51.559 part of that attack if I had reported it
00:00:54.719 the whole crisis might have been avoided
00:00:57.600 after the breach the company held a
00:00:59.600 meeting
00:01:00.800 the IT team explained how the attack
00:01:03.199 happened and the Damage it caused not
00:01:05.880 just reputational harm but also
00:01:08.320 Financial loss I was shocked and felt
00:01:11.280 guilty a simple secure reporting
00:01:14.119 Behavior could have made all the
00:01:16.439 difference here's what I learned from
00:01:18.439 this experience don't assume someone
00:01:21.320 else will report it just do it if
00:01:24.119 everyone thinks the same way nothing
00:01:26.439 gets done we all share the
00:01:28.560 responsibility know your company's
00:01:30.960 reporting process if you're unsure ask
00:01:34.680 it there are always tools to make
00:01:37.439 reporting easier never underestimate
00:01:40.399 fishing attacks even one fake email can
00:01:43.439 put the entire company at risk after
00:01:46.560 this incident I realized that combating
00:01:49.079 cyber attacks is only possible when
00:01:51.439 everyone practices secure
00:01:53.640 behaviors identifying a fishing email
00:01:56.520 Isn't Enough you have to take action
00:02:00.000 but`;

  const tactiqTranscript = useMemo(
    () => parseTactiqTranscript(tactiqRaw),
    [],
  );

  return (
    <div className="flex flex-col items-center justify-start h-full px-4 py-4 sm:px-6 overflow-y-auto">
      {/* Header Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-2 sm:mb-4 relative"
      >
        <ScenarioIcon
          isActive={true}
          isCompleted={false}
          size={40}
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-3 sm:mb-5 text-center text-gray-900 dark:text-white text-lg sm:text-xl md:text-2xl"
      >
        Gerçek Hayat Senaryosu
      </motion.h1>

      {/* Enhanced Multi-Language Video Player */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg mb-6 sm:mb-8"
      >
        <VideoPlayer
          src="https://customer-0lll6yc8omc23rbm.cloudflarestream.com/5fdb12ff1436c991f50b698a02e2faa1/manifest/video.m3u8"
          disableForwardSeek={true}
          transcript={tactiqTranscript}
          className="w-full"
        ></VideoPlayer>
      </motion.div>

      {/* Mobile Interaction Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="sm:hidden mt-2"
      >
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Videoyu izleyip transkripti inceleyin
        </p>
      </motion.div>
    </div>
  );
}