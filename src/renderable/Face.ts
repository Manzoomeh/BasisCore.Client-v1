import { FaceRowType } from "../enum/FaceRowType";

export default class Face {
  Name: string;
  ApplyReplace: boolean;
  ApplyFunction: boolean;
  RowType: FaceRowType;
  RelatedRows: Array<any[]>;
  FormattedTemplate: string;
  Levels: string[];
}
