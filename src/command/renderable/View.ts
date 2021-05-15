import RenderingTurnContext from "../../context/RenderingTurnContext";
import IData from "../../interface/IData";
import FaceCollection from "../../renderable/FaceCollection";
import RenderableBase from "../../renderable/RenderableBase";
import RenderParam from "../../renderable/RenderParam";
import ReplaceCollection from "../../renderable/ReplaceCollection";
import Util from "../../Util";

export default class View extends RenderableBase {
  constructor(element: Element) {
    super(element);
  }

  async RenderAsync(
    dataSource: IData,
    turnContext: RenderingTurnContext,
    faces: FaceCollection,
    replaces: ReplaceCollection,
    dividerRowcount: number,
    dividerTemplate: string,
    incompleteTemplate: string
  ): Promise<string> {
    var retVal = "";
    if (dataSource.Rows.length != 0) {
      var token = this.Element.GetStringToken("groupcol");
      var groupColumn = await (
        await Util.GetValueOrSystemDefaultAsync(
          token,
          turnContext.Context,
          "ViewCommand.GroupColumn"
        )
      ).toLowerCase();
      var groupList = dataSource.Rows.map((x) => x[groupColumn]).filter(
        (x, i, arr) => arr.indexOf(x) === i
      );
      var rootRenderParam = new RenderParam(
        replaces,
        groupList.length,
        dividerRowcount,
        dividerTemplate,
        incompleteTemplate
      );
      rootRenderParam.SetLevel(["1"]);

      groupList.forEach((group, _i, _) => {
        var childItems = Util.ApplySimpleFilter(
          dataSource.Rows,
          groupColumn,
          group
        );
        rootRenderParam.Data = childItems[0];
        var level1Result: string = faces.Render(
          rootRenderParam,
          turnContext.Context
        );
        var level2Result = "";
        var childRenderParam = new RenderParam(
          replaces,
          childItems.length,
          dividerRowcount,
          dividerTemplate,
          incompleteTemplate
        );
        childRenderParam.SetLevel(["2"]);
        childItems.forEach((row, _i, _) => {
          childRenderParam.Data = row;
          var renderResult = faces.Render(
            childRenderParam,
            turnContext.Context
          );
          if (renderResult) {
            level2Result += renderResult;
          }
        });
        retVal += level1Result.replace("@child", level2Result);
      });
    }
    return retVal;
  }
}
