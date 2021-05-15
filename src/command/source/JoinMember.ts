import ConstantData from "../../ConstantData";
import RenderingTurnContext from "../../context/RenderingTurnContext";
import InvalidPropertyValueException from "../../exception/InvalidPropertyValueException";
import { JoinType } from "../../enum/JoinType";
import InMemoryMember from "./InMemoryMember";
import Util from "../../Util";
import BasisCore from "../../context/BasisCore";
import IData from "../../interface/IData";

declare function $bc(): BasisCore;

export default class JoinMember extends InMemoryMember {
  constructor(element: Element) {
    super(element);
  }

  async ParseDataAsync(context: RenderingTurnContext): Promise<IData> {
    var formatToken = this.Element.GetStringToken("jointype");
    var tmpVal = await Util.GetValueOrDefaultAsync<string>(
      formatToken,
      context.Context,
      "innerjoin"
    );
    var format = JoinType[tmpVal.toLowerCase()];

    var leftData = await Util.GetValueOrDefaultAsync(
      this.Element.GetStringToken("lefttblcol"),
      context.Context
    );
    var rightData = await Util.GetValueOrDefaultAsync(
      this.Element.GetStringToken("righttblcol"),
      context.Context
    );

    var leftDataParts = leftData.split(".", 3);
    var rightDataParts = rightData.split(".", 3);

    if (leftDataParts.length != 3) {
      throw new InvalidPropertyValueException("LeftDataMember", leftData);
    }
    if (rightDataParts.length != 3) {
      throw new InvalidPropertyValueException("RightTableColumn", rightData);
    }

    var leftDataMember = leftDataParts.slice(0, 2).join(".");
    var rightDataMember = rightDataParts.slice(0, 2).join(".");

    var leftSource = await context.Context.WaitToGetDataSourceAsync(
      leftDataMember
    );
    var rightSource = await context.Context.WaitToGetDataSourceAsync(
      rightDataMember
    );

    var leftTableColumn = leftDataParts[2];
    var rightTableColumn = rightDataParts[2];

    var joinResultCol = leftSource.Data.Columns.filter(
      (x) => x != "rownumber"
    ).map((x) => `ltbl.[${x}] AS [${leftDataMember}.${x}]`);
    joinResultCol = joinResultCol.concat(
      rightSource.Data.Columns.filter((x) => x != "rownumber").map(
        (x) => `rtbl.[${x}] AS [${rightDataMember}.${x}]`
      )
    );

    var joinType = "JOIN";
    switch (format) {
      case JoinType.innerjoin: {
        joinType = "INNER JOIN";
        break;
      }
      case JoinType.leftjoin: {
        joinType = "LEFT JOIN";
        break;
      }
      case JoinType.rightjoin: {
        joinType = "RIGHT JOIN";
        break;
      }
    }
    var lib = await $bc().GetOrLoadDbLibAsync();
    var t = lib(
      `SELECT ${joinResultCol.join(
        ","
      )} FROM ? AS ltbl ${joinType} ? AS rtbl ON ltbl.${leftTableColumn} = rtbl.${rightTableColumn}`,
      [leftSource.Data.Rows, rightSource.Data.Rows]
    );

    var data = new ConstantData("", t);
    return data;
  }
}
