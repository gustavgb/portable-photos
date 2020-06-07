import React, { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import Button from '../Blocks/Button'
import { clearSelected } from '../actions'
import Modal from './Modal'

const Collapse = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  height: ${props => props.open ? `${props.theme.mixins.selectionBar.height}px` : '0'};
  overflow: hidden;
  transition: all .2s ease-out;
`

const Container = styled.div`
  padding: 0 1.8rem;
  background-color: ${props => props.theme.palette.common.white};
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
`

const Title = styled.span`
  font-size: ${props => props.theme.fontSize.body};
  margin-left: 1rem;
`

const Spacer = styled.span`
  flex: 1 0 auto;
`

const Dialog = styled.div`
  width: 40rem;
  margin: 10vh auto 0;
  max-height: 80vh;
  background-color: ${props => props.theme.palette.common.white};
  border-radius: 4px;
  padding: 1rem;
`

const DialogTitle = styled.h2`
  font-size: ${props => props.theme.fontSize.body};
  padding: 1rem 1rem 2rem;
  border-bottom: 1px solid #ddd;
  margin: 0 0 1rem;
`

const AlbumItem = styled.button`
  transition: all .1s ease-out;
  padding: 2rem 1rem;
  cursor: pointer;
  border: none;
  background: transparent;
  display: block;
  width: 100%;
  text-align: left;
  font-size: ${props => props.theme.fontSize.small};

  &:hover,
  &:focus {
    background-color: #ddd;
    outline: none;
  }
`

const Search = styled.input`
  padding: 1rem;
  width: 100%;
  font-size: ${props => props.theme.fontSize.small};
  border: 1px solid #ddd;
  border-radius: 4px;
`

const Selection = () => {
  const dispatch = useDispatch()
  const album = useSelector(state => state.library.albums.find(album => album.id === state.library.currentAlbum) || {})
  const media = album.media || []
  const libraryLastUpdate = useSelector(state => state.library.lastUpdate)
  const numSelected = useMemo(() => media.filter(media => media.isSelected).length, [libraryLastUpdate])
  const [showAlbums, setShowAlbums] = useState(false)
  const [search, setSearch] = useState('')

  const handleCancel = () => {
    dispatch(clearSelected())
  }

  const handleCreate = () => {
    window.ipcSend('request-new-album', {
      name: search,
      items: media.filter(media => media.isSelected).map(media => media.originalPath)
    })
  }

  return (
    <>
      <Modal open={showAlbums} onClose={() => setShowAlbums(false)} unmount>
        <Dialog>
          <DialogTitle>Add to album</DialogTitle>
          <Search
            placeholder='Search albums'
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {search.length > 0 && (
            <AlbumItem onClick={handleCreate}>
              Create album: <strong>{search}</strong>
            </AlbumItem>
          )}
        </Dialog>
      </Modal>
      <Collapse open={numSelected > 0}>
        <Container>
          <Button onClick={handleCancel}>Cancel</Button>
          <Title>
            {numSelected} items selected
          </Title>
          <Spacer />
          <Button onClick={() => setShowAlbums(true)}>Add to album</Button>
        </Container>
      </Collapse>
    </>
  )
}

export default Selection
