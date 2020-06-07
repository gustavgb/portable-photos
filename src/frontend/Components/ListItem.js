import styled from 'styled-components'

const ListItem = styled.button`
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

export default ListItem
