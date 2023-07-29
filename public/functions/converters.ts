import Pace from "@/components/interfaces/Pace";
import { getLiveUserIfExists } from "./twitchIntegration";

export const msToTime = (ms: number, keepMs=false): string => {
  let milliseconds = Math.floor((ms % 1000) / 100),
    seconds = Math.floor((ms / 1000) % 60),
    minutes = Math.floor((ms / (1000 * 60)) % 60);

  if (milliseconds >= 5) {
    seconds = (seconds + 1) % 60;
    if (seconds === 0) {
      minutes = (minutes + 1);
    }
  }

  const minutesStr = (minutes < 10) ? "0" + minutes : minutes;
  const secondsStr = (seconds < 10) ? "0" + seconds : seconds;

  let ret =  minutesStr + ":" + secondsStr;
  if (keepMs) {
    ret += "." + milliseconds;
  }
  return ret;
};

export const uuidToHead = (uuid: string): string => {
  const endpoint = "https://mc-heads.net/avatar/";
  return `${endpoint}${uuid}.png`
};

// TODO: Add these
const INVALID_MODS = new Set([
  "pogloot",
  "pogworld",
  "peepopractice"
]);

export const apiToPace = async (runs: any[]): Promise<Pace[]> => {
  const paces: Pace[] = [];
  for (const run of runs) {
    // Ensure run and record exist
    if (!run || !run.record) {
      continue;
    }
    const record = run.record;

    // Ensure correct version (can split in future)
    if (!record.mc_version || record.mc_version !== "1.16.1") {
      continue;
    }

    // Ensure correct category (can split in future)
    if (!record.category || record.category != "ANY" || !record.run_type || record.run_type !== "random_seed") {
      continue;
    }

    // Ensure valid modlist
    if (!run.modlist) {
      continue;
    }
    let validMods = true;
    run.modlist.forEach((mod: string) => {
      if (validMods && INVALID_MODS.has(mod)) {
        validMods = false;
      }
    })
    if (!validMods) {
      continue;
    }

    // Ensure valid metadata
    if (!record.timelines || !run.nicknames || !run.uuids || !run.twitch || !run.alt) {
      continue;
    }

    // Ensure there are enough things to show
    if (record.timelines.length === 0 || run.nicknames.length === 0 || run.uuids.length === 0 || run.twitch.length === 0 || run.alt.length === 0) {
      continue;
    }

    let latestGoodSplit = "Unknown";
    let latestGoodSplitIdx = -1;
    for (let i=record.timelines.length-1; i>-1; i--) {
      let splitName: string = record.timelines[i].name;
      if (splitToDisplayName.has(splitName)) {
        latestGoodSplit = splitToDisplayName.get(splitName)!;
        latestGoodSplitIdx = i;
        break;
      }
    }

    if (latestGoodSplitIdx === -1) {
      continue;
    }

    paces.push({
      nickname: run.nicknames[0],
      uuid: run.uuids[0],
      twitch: await getLiveUserIfExists(run.twitch[0], run.alt[0]),
      split: latestGoodSplitIdx,
      splitName: latestGoodSplit,
      time: record.timelines[latestGoodSplitIdx].igt,
    });
  }
  return paces;
}

export const paceSort = (a: Pace, b: Pace) => {
  if (a.split! > b.split!) {
    return 1;
  } else if (b.split! > a.split!) {
    return -1;
  } else {
    if (a.time < b.time) {
      return 1;
    } else if (b.time < a.time) {
      return -1;
    } else {
      return 0;
    }
  }
}

export const splitToDisplayName = new Map<string, string>([
  ["enter_nether", "Enter Nether"],
  ["enter_fortress", "Enter Fortress"],
  ["enter_bastion", "Enter Bastion"],
  ["nether_travel", "Nether Travel"],
  ["nether_travel_blind", "Nether Travel"],
  ["enter_stronghold", "Enter Stronghold"],
  ["enter_end", "Enter End"],
  ["kill_ender_dragon", "Finish"]
]);

