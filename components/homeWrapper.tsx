import { TicTacToeHome } from "./TicTacToe/ticTacToeHome";
type PageData = {
  room: string;
};
export default function HomeWrapper({ pageData }: { pageData: PageData }) {
  return (
    <>
      <TicTacToeHome parentRoom={pageData.room} />
    </>
  );
}
