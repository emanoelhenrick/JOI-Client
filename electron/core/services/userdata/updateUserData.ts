import { writeAsync } from "fs-jetpack";
import { UserDataProps } from "../../models/UserData";
import { getMetadata } from "../playlist/getMetadata";
import { getUserDataPath } from "../utils/paths";

export async function updateUserData(data: UserDataProps) {
  const { currentPlaylist } = await getMetadata()
  const USERDATA_PATH = getUserDataPath(currentPlaylist.name, currentPlaylist.profile)
  await writeAsync(USERDATA_PATH, data)
  return data
}