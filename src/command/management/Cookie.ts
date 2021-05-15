import RenderingTurnContext from "../../context/RenderingTurnContext";
import CommandBase from "../CommandBase";

//https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
//https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
//https://www.w3schools.com/js/js_cookies.asp
export default class Cookie extends CommandBase {
  constructor(element: Element) {
    super(element);
  }
  async ExecuteCommandAsync(context: RenderingTurnContext): Promise<void> {
    var name = await context.Name;
    var value = await this.GetAttributeValueAsync("value", context);
    var maxAge = await this.GetAttributeValueAsync("max-age", context);
    var path = await this.GetAttributeValueAsync("path", context);

    var str = `${name.trim()}=${value || ""}`;
    if (maxAge) {
      str += `;max-age=${maxAge}`;
    }
    if (path) {
      str += `;path=${path.trim()}`;
    }

    document.cookie = str;
    await this.ApplyResultAsync("", context, true);
  }
}
