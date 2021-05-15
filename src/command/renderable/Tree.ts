import RenderingTurnContext from "../../context/RenderingTurnContext";
import IData from "../../interface/IData";
import FaceCollection from "../../renderable/FaceCollection";
import RenderableBase from "../../renderable/RenderableBase";
import RenderParam from "../../renderable/RenderParam";
import ReplaceCollection from "../../renderable/ReplaceCollection";
import Util from "../../Util";

export default class Tree extends RenderableBase {
  constructor(element: Element) {
    super(element);
  }

  async RenderAsync(
    dataSource: IData,
    tuenContext: RenderingTurnContext,
    faces: FaceCollection,
    replaces: ReplaceCollection,
    dividerRowcount: number,
    dividerTemplate: string,
    incompleteTemplate: string
  ): Promise<string> {
    var retVal = "";
    if (dataSource.Rows.length != 0) {
      var foreignKey = await this.GetAttributeValueAsync(
        "parentidcol",
        tuenContext,
        "parentid"
      );
      var principalKey = await this.GetAttributeValueAsync(
        "idcol",
        tuenContext,
        "id"
      );
      var nullValue = await this.GetAttributeValueAsync(
        "nullvalue",
        tuenContext,
        "0"
      );
      var rootRecords = Util.ApplySimpleFilter(
        dataSource.Rows,
        foreignKey,
        nullValue
      );
      if (rootRecords.length == 0) {
        throw new Error(
          `Tree Command Has No Root Record In Data Member '${dataSource.Name}' With '${nullValue}' Value In '${foreignKey}' Column That Set In NullValue Attribute.`
        );
      }
      var rootRenderParam = new RenderParam(
        replaces,
        rootRecords.length,
        dividerRowcount,
        dividerTemplate,
        incompleteTemplate
      );
      rootRecords.forEach((row) => {
        rootRenderParam.Data = row;
        retVal += this.RenderLevel(
          dataSource,
          rootRenderParam,
          1,
          faces,
          replaces,
          tuenContext,
          dividerRowcount,
          dividerTemplate,
          incompleteTemplate,
          principalKey,
          foreignKey
        );
      });
    }
    return retVal;
  }

  RenderLevel(
    dataSource: IData,
    parentRenderParam: RenderParam,
    level: number,
    faces: FaceCollection,
    replaces: ReplaceCollection,
    context: RenderingTurnContext,
    dividerRowcount: number,
    dividerTemplate: string,
    incompleteTemplate: string,
    principalKey: string,
    foreignKey: string
  ): string {
    var retVal = "";
    var childRenderResult = "";
    var childRows = Util.ApplySimpleFilter(
      dataSource.Rows,
      foreignKey,
      parentRenderParam.Data[principalKey]
    );

    var groups: { [key: string]: any } = {};
    if (childRows.length != 0) {
      var newLevel = level + 1;
      var childRenderParam = new RenderParam(
        replaces,
        childRows.length,
        dividerRowcount,
        dividerTemplate,
        incompleteTemplate
      );

      childRows.forEach((row) => {
        childRenderParam.Data = row;
        childRenderResult += this.RenderLevel(
          dataSource,
          childRenderParam,
          newLevel,
          faces,
          replaces,
          context,
          dividerRowcount,
          dividerTemplate,
          incompleteTemplate,
          principalKey,
          foreignKey
        );
      });
      groups[""] = childRenderResult;

      parentRenderParam.SetLevel([`${level}`]);
    } else {
      groups[""] = "";
      parentRenderParam.SetLevel([`${level}`, "end"]);
    }
    retVal = faces.Render(parentRenderParam, context.Context);
    if (retVal) {
      Object.getOwnPropertyNames(groups).forEach(
        (key) =>
          (retVal = retVal.replace(
            `@child${key ? `(${key})` : ""}`,
            groups[key]
          ))
      );
    }

    return retVal;
  }
}
