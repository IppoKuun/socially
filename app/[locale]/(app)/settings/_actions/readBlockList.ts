import { getUserBlockList } from "@/lib/settings/block/queries";

export default async function readBlockListAction(cursor?: string) {
  return getUserBlockList(cursor);
}
