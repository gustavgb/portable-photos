import styled from 'styled-components'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setInitProgress, setInitializing } from '../actions'

const InitProgressBox = styled.div`
  position: fixed;
  opacity: ${props => props.show ? 1 : 0};
  bottom: ${props => props.show ? 0 : '-50px'};
  pointer-events: ${props => props.show ? 'all' : 'none'};
  right: 0;
  left: 0;
  font-size: ${props => props.theme.fontSize.body};
  background-color: ${props => props.theme.palette.dark.main};
  color: ${props => props.theme.palette.common.white};
  transition: all 0.25s ease-out;
  padding: 1rem 1.2rem;
  height: ${props => props.theme.mixins.initProgress.height}px;
  display: flex;
  align-items: center;
`

const InitProgress = () => {
  const dispatch = useDispatch()
  const progress = useSelector(state => state.init.progress)
  const isInitializing = useSelector(state => state.init.isInitializing)

  useEffect(() => {
    const progressListener = window.ipcListen('init-progress', (event, progress) => {
      dispatch(setInitProgress(`${(progress.progress * 100).toFixed(2)}%: ${progress.status}`))
    })
    const startListener = window.ipcListen('init-start', (event, progress) => {
      dispatch(setInitializing(true))
    })
    const endListener = window.ipcListen('init-end', (event, progress) => {
      dispatch(setInitializing(false))
    })

    return () => {
      progressListener()
      startListener()
      endListener()
    }
  }, [])

  return (
    <InitProgressBox show={isInitializing}>
      {progress || ''}
    </InitProgressBox>
  )
}

export default InitProgress
