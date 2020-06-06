import React from 'react'
import styled from 'styled-components'
import circle from '../assets/circle.svg'
import circleChecked from '../assets/check-circle.svg'

const PhotoOuter = styled.div`
  height: 0;
  padding-bottom: 100%;
  position: relative;
`

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
  opacity: ${props => props.isSelected ? 1 : 0.5};
  background: transparent;
  transition: all .1s linear;

  &:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }
`

const Photo = ({ src, isSelected, onSelect }) => {
  return (
    <PhotoOuter>
      <PhotoInner src={src} isSelected={isSelected} />
      <SelectorBox onClick={onSelect} isSelected={isSelected}>
        <Selector isSelected={isSelected} />
      </SelectorBox>
    </PhotoOuter>
  )
}

export default Photo
