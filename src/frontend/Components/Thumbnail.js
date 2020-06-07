import React, { useRef } from 'react'
import styled from 'styled-components'
import circle from '../assets/circle.svg'
import circleChecked from '../assets/check-circle.svg'
import film from '../assets/film.svg'

const PhotoInner = styled.div.attrs(props => ({
  style: {
    backgroundImage: `url(${props.src})`,
    width: props.isSelected ? '90%' : '100%',
    height: props.isSelected ? '90%' : '100%',
    top: props.isSelected ? '5%' : 0,
    left: props.isSelected ? '5%' : 0
  }
}))`
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  position: absolute;
  transition: all .2s ease-out;
`

const Selector = styled.div`
  background: url(${props => props.isSelected ? circleChecked : circle}), linear-gradient(#fff, #fff);
  background-position: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  border-radius: 50%;
  width: 100%;
  height: 100%;
`

const SelectorBox = styled.div`
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  width: 3rem;
  height: 3rem;
  padding: 0.75rem;
  opacity: ${props => props.isSelected ? '1 !important' : 0};
  background: transparent;
  transition: all .1s linear;

  &:hover {
    opacity: 1 !important;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }
`

const PhotoOuter = styled.div`
  height: 0;
  padding-bottom: 100%;
  position: relative;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};

  &:hover > ${SelectorBox} {
    opacity: 0.5;
  }
`

const VideoIcon = styled.div`
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: url(${film}), linear-gradient(#fff, #fff);
  background-position: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
`

const Photo = ({
  src,
  isSelected,
  onSelect,
  onMouseEnter,
  onClick,
  isHovered,
  isVideo
}) => {
  const innerRef = useRef(null)
  const handleClick = (e) => {
    if (isHovered) {
      onSelect()
    } else if (e.target === innerRef.current) {
      onClick()
    }
  }

  return (
    <PhotoOuter
      onMouseOver={onMouseEnter}
      clickable={!isHovered}
    >
      <PhotoInner
        src={src}
        isSelected={isSelected || isHovered}
        onClick={handleClick}
        ref={innerRef}
      />
      <SelectorBox onClick={onSelect} isSelected={isSelected}>
        <Selector isSelected={isSelected} />
      </SelectorBox>
      {isVideo && <VideoIcon />}
    </PhotoOuter>
  )
}

export default Photo
