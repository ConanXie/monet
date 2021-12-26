import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import clsx from "clsx"
import type { LinksFunction } from "remix"

import { ImageDominant } from "~/components"

import stylesUrl from "~/styles/index.css"
import { useTheme } from "~/providers/theme"

export const imageAccepts: string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]

export const imageRe = new RegExp(`^${imageAccepts.join("|")}$`)

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }]
}

type ImageItem = {
  image: string
  t: number
}

let lastScrollTop = 0
let dominantContainers: NodeListOf<HTMLElement>

export default function Index() {
  const dropRef = useRef<HTMLDivElement>(null)
  const [dragIn, setDragIn] = useState<boolean>(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const offsetTopList = useRef<number[]>([])
  const currentIndex = useRef(0)

  const theme = useTheme()

  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault()
    setDragIn(true)
  }

  const handleDrag = (event: DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = async (event: DragEvent) => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.dataTransfer?.files[0]
    if (file) {
      const matched = imageRe.test(file.type)
      if (!matched) {
        return
      }

      const fr = new FileReader()

      fr.onload = () => {
        images.unshift({
          image: fr.result as string,
          t: Date.now(),
        })
        setImages([...images])
      }

      fr.readAsDataURL(file)
    }
    handleDragLeave()
  }

  const handleDragLeave = () => {
    setDragIn(false)
  }

  useEffect(() => {
    const el = dropRef.current
    el?.addEventListener("dragenter", handleDragEnter)
    el?.addEventListener("dragover", handleDrag)
    el?.addEventListener("dragleave", handleDragLeave)
    el?.addEventListener("drop", handleDrop)
  }, [])

  const handleScroll = useCallback(() => {
    const { scrollTop, clientHeight } = document.documentElement

    const direction: 1 | -1 = scrollTop > lastScrollTop ? 1 : -1
    lastScrollTop = scrollTop

    const centerLine = scrollTop + clientHeight / 2
    const current = currentIndex.current
    const last = current - 1
    const next = current + 1
    const offsets = offsetTopList.current
    // console.log(
    //   "centerLine",
    //   centerLine,
    //   offsetTopList,
    //   "current",
    //   current,
    //   "next",
    //   offsets[next],
    //   "last",
    //   offsets[last],
    // )
    if (direction == 1 && centerLine > offsets[next]) {
      currentIndex.current = next
    } else if (direction == -1 && centerLine < offsets[current]) {
      currentIndex.current = last
    }
    if (current != currentIndex.current) {
      console.log(currentIndex.current)
      const color = dominantContainers[currentIndex.current]?.dataset.color
      if (color) {
        theme?.changeTheme(color)
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener("scroll", handleScroll)

    return () => {
      document.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const offsets: number[] = []
      dominantContainers = document.querySelectorAll<HTMLElement>(
        ".dominant-container",
      )

      dominantContainers.forEach((e) => {
        offsets.push(e.offsetTop)
      })
      console.log(offsets)
      offsetTopList.current = offsets
    }, 200)
  }, [images])

  return (
    <div className="dominant">
      <h1>Dominant of an image</h1>
      <div ref={dropRef} className={clsx("drop-area", { "drag-in": dragIn })}>
        <h2>{dragIn ? "drop it" : "drag an image here"}</h2>
      </div>
      {images.map(({ image, t }) => (
        <ImageDominant key={t} src={image} />
      ))}
    </div>
  )
}
