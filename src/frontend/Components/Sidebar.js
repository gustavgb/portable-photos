import React from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentAlbum } from '../actions'

const Container = styled.div`
  padding: 1rem;
  width: 25rem;
  max-height: 100vh;
  overflow-y: auto;
  position: sticky;
  top: 0;
`

const AlbumItem = styled.button`
  transition: all .1s ease-out;
  padding: 2rem 1rem;
  cursor: pointer;
  border: none;
  background-color: ${props => props.selected ? '#ddd' : 'transparent'};
  display: block;
  width: 100%;
  text-align: left;
  font-size: ${props => props.theme.fontSize.body};

  &:hover,
  &:focus {
    background-color: #ddd;
    outline: none;
  }
`

const Sidebar = () => {
  const dispatch = useDispatch()
  const albums = useSelector(state => state.library.albums)
  const currentAlbum = useSelector(state => state.library.currentAlbum)

  const handleSelect = (id) => {
    dispatch(setCurrentAlbum(id))
  }

  return (
    <div>
      <Container>
        {albums.map(album => (
          <AlbumItem
            key={album.id}
            selected={album.id === currentAlbum}
            onClick={() => handleSelect(album.id)}
          >
            {album.name}
          </AlbumItem>
        ))}
      </Container>
    </div>
  )
}

export default Sidebar
