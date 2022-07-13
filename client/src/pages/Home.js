import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styled from "styled-components";

const THUMBNAIL_COUNT = 31;
let mouseDown = false;
let mouseMove = false;

function Home() {
  let canvas = document.createElement("canvas");

  const [thumbnails, setThumbnails] = useState([]);
  const [barTime, setBarTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTimes, setCurrentTimes] = useState(0);

  const videoControl = useRef();
  const barPointer = useRef();
  const videoRef = useRef();
  const file = useRef();

  const handleFileSave = (e) => {
    const formData = new FormData();
    formData.append("test", file.current.files[0]);

    axios({
      method: "post",
      url: "https://localhost:4000/api/filesave",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleChangeVideo = (e) => {
    videoRef.current.src = URL.createObjectURL(file.current.files[0]);
    setTimeout(() => {
      setDuration(videoRef.current.duration);
    }, 100);
  };

  const setCurrentTime = (time) => {
    videoRef.current.currentTime = time;
  };

  const getImageAt = () => {
    return new Promise((resolve) => {
      videoRef.current.addEventListener(
        "seeked",
        () => {
          const context = canvas.getContext("2d");

          context.drawImage(
            videoRef.current,
            0,
            0,
            canvas.width,
            canvas.height
          );

          resolve(canvas.toDataURL());
        },
        {
          once: true,
        }
      );
    });
  };

  const makeThumbnail = (start, end) => {
    new Promise((resolve, reject) => {
      try {
        (async () => {
          const gap = (end - start) / (THUMBNAIL_COUNT - 1);
          let secs = end;
          const images = new Array(THUMBNAIL_COUNT);

          for (let count = THUMBNAIL_COUNT - 1; count > 0; count -= 1) {
            setCurrentTime(secs);

            const image = await getImageAt();

            secs -= gap;
            images[count] = {
              time: secs,
              image,
            };
          }

          setCurrentTime(start);
          images[0] = {
            time: 0,
            image: await getImageAt(),
          };

          resolve(images);
        })();
      } catch (e) {}
    }).then((res) => {
      setThumbnails(res);
    });
  };

  const handleChangeVideoTime = (e) => {
    setCurrentTimes(e.target.value);
    setBarTime(e.target.value);
    videoRef.current.currentTime = currentTimes;
  };

  function handleBarPointerDown(e) {
    // console.log("down");
    mouseDown = true;
    const percent = e.nativeEvent.layerX / barPointer.current.clientWidth;
    setBarTime(percent * duration);
    setCurrentTimes(percent * duration);
    videoRef.current.currentTime = currentTimes;
  }

  function handleBarPointerUp(e) {
    // console.log("up");
    mouseDown = false;
    mouseMove = false;
  }

  function handleBarPointerMove(e) {
    if (mouseDown) {
      if (!mouseMove) mouseMove = true;
      const percent = e.nativeEvent.layerX / barPointer.current.clientWidth;
      setBarTime(percent * duration);
      setCurrentTimes(percent * duration);
      videoRef.current.currentTime = currentTimes;
    }
  }

  function handleExportTransferVideoFile(e, file) {
    axios({
      method: "post",
      url: "/api/transfer/export",
      file: file,
    });
  }

  function getTimes(timeNumber) {
    // const h = timeNumber / 60 / 60;
    // const m = timeNumber / 60;
    const s = timeNumber % 60;

    return `00:00:${parseInt(s).toString().padStart(2, 0)}`;
  }

  useEffect(() => {
    window.addEventListener("mouseup", handleBarPointerUp);
    // window.addEventListener("mousemove", handleBarPointerMove);

    return () => {
      window.removeEventListener("mouseup", handleBarPointerUp);
      // window.removeEventListener("mousemove", handleBarPointerMove);
    };
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}>
        <video
          ref={videoRef}
          style={{
            width: 640,
            height: 480,
          }}></video>
        <input
          ref={videoControl}
          type='range'
          onChange={handleChangeVideoTime}
          value={currentTimes}
          step={0.001}
          min={0}
          max={duration}
          style={{
            width: 500,
            accentColor: "green",
          }}
        />
      </div>
      <form action='/filesave' encType='multipart/form-data' method='post'>
        <input
          ref={file}
          type='file'
          name='test'
          onChange={handleChangeVideo}
        />
        <input type='button' onClick={handleFileSave} value='submit' />
      </form>
      <button
        onClick={(e) =>
          makeThumbnail(0, videoRef.current.duration - 1 / THUMBNAIL_COUNT)
        }>
        make thumbnail
      </button>
      <div
        style={{
          position: "relative",
        }}>
        <div
          onMouseDown={handleBarPointerDown}
          onMouseMove={handleBarPointerMove}
          ref={barPointer}
          style={{
            display: "flex",
            flexWrap: "nowrap",
            width: "100%",
            height: 150,
            overflow: "hidden",
            userSelect: "none",
          }}>
          {thumbnails.map(
            ({ image, time }, idx) =>
              idx !== thumbnails.length - 1 && (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    height: "100%",
                    width: `calc(100% / ${THUMBNAIL_COUNT})`,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}>
                  <img
                    src={image}
                    alt={"thumbnail-" + idx}
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                  <time style={{ fontSize: 12 }}>{getTimes(time)}</time>
                </div>
              )
          )}
        </div>
        <Bar location={barTime} duration={duration} />
      </div>
      <button
        onClick={(e) =>
          handleExportTransferVideoFile(e, file.current.files[0])
        }>
        영상 변환 추출
      </button>
    </div>
  );
}

const Bar = styled.div.attrs(({ location, duration }) => ({
  style: {
    left: `calc((${location || 0} / ${duration || 1}) * 100% - 1.5px)`,
  },
}))`
  position: absolute;
  z-index: 5;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: red;
  pointer-events: none;
`;

export default React.memo(Home);
