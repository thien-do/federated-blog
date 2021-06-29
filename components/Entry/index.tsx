import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@moai/core';
import { HiOutlineExternalLink as externalLink } from 'react-icons/hi';
import { encodePostUrl, getHostName } from '@/utils/url';
import { excerpt, minimum as minimumStringLength } from '@/utils/string';
import { formatDate } from '@/utils/date';
import { RoundedPanel } from '../RoundedPane';
import styles from './Entry.module.css';

const DEFAULT_AVATAR = 'kaonashi.jpg';

export const EntryAuthor = ({ author }) => {
  const { name, avatar_url, url } = author;
  const hostName = getHostName(url);
  const blogUrl = `https://${hostName}`;
  const avatar = `/avatars/${avatar_url || DEFAULT_AVATAR}`;
  return (
    <div className={styles.entryAuthor}>
      <div className={styles.entryAvatar}>
        <Image alt={name} src={avatar} width={48} height={48} />
      </div>
      <div className="info">
        <Link href={`/?author=${hostName}`} passHref>
          <a>
            <b>{name}</b>
          </a>
        </Link>
        <div>
          <Link href={blogUrl}>
            <a>{hostName}</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const Entry = ({ doc, showAuthor = true }) => {
  const encodedUrl = encodePostUrl(doc.link, doc.authorIdx);
  return (
    <RoundedPanel>
      {showAuthor ? <EntryAuthor author={doc.author} /> : null}
      <h3 className="entry-title mt-0">
        <a href={`/read/${encodedUrl}`}>{doc.title}</a>
      </h3>
      <p>Đăng ngày {formatDate(doc.pubDate)}</p>
      <p className="justify">
        {excerpt(minimumStringLength(doc.contentSnippet, 5), 50)}
      </p>
      <div className={styles.readMoreArea}>
        <Link href={`/read/${encodedUrl}`} passHref>
          <Button highlight>Đọc tiếp</Button>
        </Link>
        <Button iconRight icon={externalLink} href={doc.link} target="_blank">
          Đọc trên blog của tác giả
        </Button>
      </div>
    </RoundedPanel>
  );
};
