export interface IFileComparisonResult {
  fileName: string;
  matched: boolean;
  differences?: string[];
  oldContent?: any;
  newContent?: any;
}