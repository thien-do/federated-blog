import React from 'react';
import { NextPageContext } from 'next';
import Parser from 'rss-parser';
import qs from 'qs';
import { Button, DivPx } from '@moai/core';
import NodeCache from 'node-cache';
import {
  HiOutlineChevronLeft as PrevIcon,
  HiOutlineChevronRight as NextIcon
} from 'react-icons/hi';
import Link from 'next/link';
import { Entry, EntryAuthor } from '@/components/Entry';
import Layout from '@/components/Layout';
import { RoundedPanel } from '@/components/RoundedPane';
import styles from '@/styles/Home.module.css';
import channelsData from '@/channels.json';
import { getHostName } from '@/utils/url';

const CACHE_DURATION = 60 * 15; // 15 minutes cache
const cache = new NodeCache({ stdTTL: CACHE_DURATION });
const PAGE_SIZE = 20;

type RSSItems = ({
  [key: string]: any;
} & Parser.Item)[];

export const getServerSideProps = async (context: NextPageContext) => {
  const { page = '1', author = null } = context.query;
  const pageNumber = parseInt(page as string, 10);
  const parser = new Parser();
  const cacheKey = (author as string) || 'all_docs';
  let docs: RSSItems = cache.get(cacheKey);
  if (!docs) {
    const channels =
      cacheKey === 'all_docs'
        ? channelsData.channels
        : channelsData.channels.filter(
            (channel) => getHostName(channel.url) === author
          );
    docs = (
      await Promise.all(
        channels.map(async (channel, channelIndex) => {
          const result = await parser.parseURL(channel.url);
          return (
            result?.items.map((item) => ({
              ...item,
              author: channel,
              authorIdx: channelIndex
            })) ?? []
          );
        })
      )
    ).flat();
    docs.sort((a, b) => {
      let da = new Date(b.pubDate);
      let db = new Date(a.pubDate);
      return +da - +db;
    });
    cache.set(cacheKey, docs);
  }
  return {
    props: {
      author: author,
      docs: docs.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE),
      page: pageNumber,
      totalPages: Math.ceil(docs.length / PAGE_SIZE)
    }
  };
};

const Home = ({ docs, page, totalPages, author }) => {
  const nextPage = qs.stringify(
    { page: page + 1, author },
    { skipNulls: true }
  );
  const prevPage = qs.stringify(
    { page: page - 1, author },
    { skipNulls: true }
  );
  const currentAuthor = author && docs.length && docs[0].author;
  return (
    <Layout>
      {author && (
        <RoundedPanel>
          <Link href="/" passHref>
            <Button icon={PrevIcon}>Xem toàn bộ tác giả</Button>
          </Link>
          <DivPx size={32} />
          <EntryAuthor author={currentAuthor} />
        </RoundedPanel>
      )}
      {docs.map((doc) => (
        <Entry doc={doc} key={doc.link} showAuthor={author === null} />
      ))}
      <RoundedPanel transparent={true}>
        <div className={styles.paginationSection}>
          {page > 1 ? (
            <Link href={`?${prevPage}`} passHref>
              <Button icon={PrevIcon}>Trang trước</Button>
            </Link>
          ) : (
            <div />
          )}
          {totalPages > 1 && (
            <div className={styles.paginationInfo}>
              Trang {page} / {totalPages}
            </div>
          )}
          {page < totalPages ? (
            <Link href={`?${nextPage}`} passHref>
              <Button icon={NextIcon} iconRight>
                Trang sau
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </RoundedPanel>
    </Layout>
  );
};

export default Home;
