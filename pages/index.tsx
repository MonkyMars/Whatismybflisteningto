import type { NextPage } from "next";
import React, { useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.scss";
import { useRouter } from "next/router";

interface Song {
  title: string;
  artist: string;
  maxLength: string;
  timestamp: string;
  albumImage: string;
  href: string;
}

const Home: NextPage = () => {
  const [timestamp, setTimestamp] = React.useState("0:00");
  const [progress, setProgress] = React.useState(60);
  const [next, setNext] = React.useState(true);
  const router = useRouter();
  const [token, setToken] = React.useState<string>("");
  const [song, setSong] = React.useState<Song>({
    title: "",
    artist: "",
    maxLength: "",
    timestamp: "",
    albumImage: "/default.bmp",
    href: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");

    const fetchSong = async () => {
      if (!accessToken) return;
      if (next) {
        try {
          const response = await fetch(
            "https://api.spotify.com/v1/me/player/currently-playing",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (response.status === 204) {
            console.log("No song currently playing");
            return;
          } else if (response.status === 401) {
            setToken("");
          }
          const data = await response.json();
          if (data && accessToken) {
            setToken(accessToken);
          }
          if (data?.item) {
            const newSong: Song = {
              title: data.item.name,
              artist: data.item.artists
                .map((artist: any) => artist.name)
                .join(", "),
              maxLength: new Date(data.item.duration_ms)
                .toISOString()
                .substr(14, 5),
              timestamp: new Date(data.progress_ms).toISOString().substr(14, 5),
              albumImage:
                data.item.album.images[0]?.url || "/default-cover.png",
              href: data.item.album.href,
            };
            setSong(newSong);
            setTimestamp(newSong.timestamp);
          } else {
            setToken("");
          }
        } catch (error) {
          console.error("Error fetching song:", error);
        } finally {
          setNext(false);
        }
      }
    };

    fetchSong();
  }, [token, next]);

  useEffect(() => {
    if (token) {
      const updateTimestamp = () => {
        const [minutes, seconds] = timestamp.split(":").map(Number);
        let updatedSeconds = seconds + 1;
        let updatedMinutes = minutes;

        if (updatedSeconds >= 60) {
          updatedSeconds = 0;
          updatedMinutes += 1;
        }
        const [minutesD, secondsD] = song.maxLength.split(":");
        const durationMinutes = parseInt(minutesD);
        const durationSeconds = parseInt(secondsD);
        if (
          updatedMinutes === durationMinutes &&
          updatedSeconds >= durationSeconds
        ) {
          setNext(true);
        }
        setTimestamp(
          `${updatedMinutes}:${updatedSeconds.toString().padStart(2, "0")}`
        );
      };
      const intervalId = setInterval(updateTimestamp, 1000);

      return () => clearInterval(intervalId);
    }
  }, [timestamp, song.maxLength, token]);

  useEffect(() => {
    const intervalId = setInterval(() => setNext(true), 100 * 10 * 15);
    return () => clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    if (token) {
      const calculateProgress = () => {
        const [minutes, seconds] = timestamp.split(":");
        const totalProgress = parseInt(minutes) * 60 + parseInt(seconds);
        const [minutesD, secondsD] = song.maxLength.split(":");
        const minutesDuration = parseInt(minutesD);
        const secondsDuration = parseInt(secondsD);
        const totalMaxLength = minutesDuration * 60 + secondsDuration;
        let songProgress = (totalProgress / totalMaxLength) * 100;
        songProgress = (songProgress / 60) * 100;
        setProgress(Math.round(songProgress / 2.75));
        calculateProgress();
      };
    }
  }, [progress, timestamp, song.maxLength, token]);

  return (
    <>
      <Head>
        <title>{"What is my bf listening to?"}</title>
      </Head>
      <nav className={styles.nav}>
        {!token && (
          <button onClick={() => router.push("/api/login")}>{"Login"}</button>
        )}
      </nav>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{"What is my bf listening to?"}</h1>
          <h2>{"Your bf is listening to:"}</h2>
        </header>

        <div className={styles.songInfo}>
          <div>
            <Image
              alt="Album cover"
              src={song.albumImage}
              width={200}
              height={200}
              priority
              draggable={false}
            />
            <div className={styles.songTitle}>
              <label
                onClick={() =>
                  song.href
                    ? `${song.href}/?access_token=${encodeURIComponent(token)}`
                    : "#"
                }
              >
                {song.title}
              </label>

              <label>{song.artist}</label>
            </div>
          </div>
          <div className={styles.timestamps}>
            <label>{timestamp}</label>
            <span style={{ width: progress + "%" }}></span>
            <label>{song.maxLength}</label>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
