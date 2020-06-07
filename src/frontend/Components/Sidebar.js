import React from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentAlbum } from '../actions'
import ListItem from './ListItem'

const Container = styled.div`
  padding: 1rem;
  width: 25rem;
  max-height: 100vh;
  overflow-y: auto;
  position: sticky;
  top: 0;
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
          <ListItem
            key={album.id}
            selected={album.id === currentAlbum}
            onClick={() => handleSelect(album.id)}
          >
            {album.name}
          </ListItem>
        ))}
      </Container>
    </div>
  )
}

export default Sidebar
