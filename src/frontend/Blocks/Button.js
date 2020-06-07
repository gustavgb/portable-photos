import styled from 'styled-components'

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  display: block;
  margin: 0.4rem 0;
  cursor: pointer;
  font-size: ${props => props.theme.fontSize.small};
`

export default Button
