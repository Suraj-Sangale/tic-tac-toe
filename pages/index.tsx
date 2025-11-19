import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import HomeWrapper from "../components/homeWrapper";
import { GetServerSideProps } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
type PageData = {
  room: string;
};
export default function Home({ pageData }: { pageData: PageData }) {
  return <HomeWrapper pageData={pageData} />;
}


export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;

  const { room = "" } = query;
  const pageData: PageData = {
    room: room as string,
  };

  return {
    props: {
      pageData,
    },
  };
};
