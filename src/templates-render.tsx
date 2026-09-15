import { renderToString } from "react-dom/server";
import Templates from "./Templates";
export const render = (slug = "") => renderToString(<Templates slug={slug}/>);
