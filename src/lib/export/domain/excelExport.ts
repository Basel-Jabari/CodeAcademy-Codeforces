function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// SpreadsheetML column widths are in POINTS, not characters.
// Excel's default column (8.43 chars) is 48pt, so one character is ~5.7pt.
const pointsPerCharacter: number = 5.7;
const minCharacters: number = 8;
const maxCharacters: number = 70;

function columnWidthPoints(longestCell: number): number {
  const characters: number = Math.max(
    minCharacters,
    Math.min(maxCharacters, longestCell + 2),
  );
  return Math.round(characters * pointsPerCharacter * 100) / 100;
}

function buildSheetXml(name: string, rows: string[][]): string {
  const columnCount: number = rows.reduce(
    (max: number, row: string[]) => Math.max(max, row.length),
    0,
  );

  const columnsXml: string[] = [];
  for (let column = 0; column < columnCount; column++) {
    let longest: number = 0;
    rows.forEach((row: string[]) => {
      const cell: string = row[column] || "";
      longest = Math.max(longest, cell.length);
    });

    columnsXml.push(
      `<Column ss:Index="${column + 1}" ss:AutoFitWidth="0" ss:Width="${columnWidthPoints(
        longest,
      )}"/>`,
    );
  }

  const rowsXml: string = rows
    .map((row: string[], rowIndex: number) => {
      const styleId: string = rowIndex === 0 ? "header" : "body";
      const cells: string = row
        .map(
          (cell: string) =>
            `<Cell ss:StyleID="${styleId}">` +
            `<Data ss:Type="String">${escapeXml(cell)}</Data>` +
            `</Cell>`,
        )
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  return (
    `<Worksheet ss:Name="${escapeXml(name)}">` +
    `<Table ss:ExpandedColumnCount="${columnCount}" ` +
    `ss:ExpandedRowCount="${rows.length}" x:FullColumns="1" x:FullRows="1">` +
    columnsXml.join("") +
    rowsXml +
    `</Table>` +
    `<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">` +
    `<FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal>` +
    `<TopRowBottomPane>1</TopRowBottomPane><ActivePane>2</ActivePane>` +
    `</WorksheetOptions>` +
    `</Worksheet>`
  );
}

const stylesXml: string =
  `<Styles>` +
  `<Style ss:ID="Default" ss:Name="Normal">` +
  `<Alignment ss:Vertical="Top" ss:WrapText="0"/>` +
  `<Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>` +
  `</Style>` +
  `<Style ss:ID="header">` +
  `<Alignment ss:Vertical="Center" ss:WrapText="0"/>` +
  `<Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>` +
  `<Interior ss:Color="#DDEBF7" ss:Pattern="Solid"/>` +
  `<Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/></Borders>` +
  `</Style>` +
  `<Style ss:ID="body">` +
  `<Alignment ss:Vertical="Top" ss:WrapText="0"/>` +
  `</Style>` +
  `</Styles>`;

export interface ExcelSheet {
  name: string;
  rows: string[][];
}

// Excel SpreadsheetML: one file, one sheet per table, opens in Excel and Google Sheets
export function downloadExcelSheets(
  filename: string,
  sheets: ExcelSheet[],
): void {
  const body: string = sheets
    .map((sheet: ExcelSheet) => buildSheetXml(sheet.name, sheet.rows))
    .join("");

  const xml: string =
    `<?xml version="1.0"?>` +
    `<?mso-application progid="Excel.Sheet"?>` +
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ` +
    `xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:x="urn:schemas-microsoft-com:office:excel" ` +
    `xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ` +
    `xmlns:html="http://www.w3.org/TR/REC-html40">` +
    stylesXml +
    body +
    `</Workbook>`;

  const blob = new Blob(["\ufeff" + xml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url: string = URL.createObjectURL(blob);
  const link: HTMLAnchorElement = document.createElement("a");

  link.href = url;
  link.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
