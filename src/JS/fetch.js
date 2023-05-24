import { Core } from "./core";
import { Error } from "./tools";

export const fetchRecents = async() => {
  const res = await Core.API_Fetch({url: `/activity/recent/main`}) || {};
  if (res?.err) { Error(`Failed to Fetch Recents: ${res.err}`) }
  return res;
}

export const fetchDirectory = async({folder}) => {
  const res = await Core.API_Fetch({url:`/folder/${folder}?s=main`}) || {};
  if (res?.err) { Error(`Failed to Fetch Directory: ${res.err}`) }
  return res;
}
