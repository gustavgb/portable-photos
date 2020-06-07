import styled from 'styled-components'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStatus } from '../actions'

const Container = styled.div`
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

const Spacer = styled.span`
  flex: 1 0 auto;
`

const StatusBar = () => {
  const dispatch = useDispatch()
  const status = useSelector(state => state.status)

  useEffect(() => {
    const progressListener = window.ipcListen('send-status', (event, status) => {
      dispatch(setStatus({
        message: `${(status.progress * 100).toFixed(2)}%: ${status.label}`,
        cancelId: status.cancelId
      }))
    })
    const endListener = window.ipcListen('end-status', (event, progress) => {
      dispatch(setStatus({ message: '' }))
    })

    return () => {
      progressListener()
      endListener()
    }
  }, [])

  const handleCancel = () => {
    window.ipcSend('request-service-cancel')
  }

  return (
    <Container show={status && status.message}>
      {status && (status.message || '')}
      <Spacer />
      {status.cancelId && (
        <button onClick={handleCancel}>Cancel</button>
      )}
    </Container>
  )
}

export default StatusBar
