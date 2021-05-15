import Call from "./collection/Call";
import Group from "./collection/Group";
import Repeater from "./collection/Repeater";
import CommandBase from "./CommandBase";
import CommandStorage from "./CommandStorage";
import Cookie from "./management/Cookie";
import List from "./renderable/List";
import Print from "./renderable/Print";
import Tree from "./renderable/Tree";
import View from "./renderable/View";
import Callback from "./source/Callback";
import DbSource from "./source/DbSource";
import InlineSource from "./source/InlineSource";
import UnknownCommand from "./UnknownCommand";

export default class CommandMaker {
  public static ToCommand(element: Element): CommandBase {
    var retVal: CommandBase;
    var metadate = CommandStorage.Current.Get(element);
    if (metadate === undefined) {
      var core = element.getAttribute("core")?.toLowerCase();

      switch (core) {
        case "group": {
          retVal = new Group(element);
          break;
        }
        case "print": {
          retVal = new Print(element);
          break;
        }
        case "tree": {
          retVal = new Tree(element);
          break;
        }
        case "list": {
          retVal = new List(element);
          break;
        }
        case "view": {
          retVal = new View(element);
          break;
        }
        case "dbsource": {
          retVal = new DbSource(element);
          break;
        }
        case "call": {
          retVal = new Call(element);
          break;
        }
        case "cookie": {
          retVal = new Cookie(element);
          break;
        }
        case "repeater": {
          retVal = new Repeater(element);
          break;
        }
        case "inlinesource": {
          retVal = new InlineSource(element);
          break;
        }
        case "callback": {
          retVal = new Callback(element);
          break;
        }
        default: {
          retVal = new UnknownCommand(element);
          break;
        }
      }
    } else {
      retVal = metadate.Command;
    }
    return retVal;
  }
}
