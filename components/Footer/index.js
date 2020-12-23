import React from 'react'
import Link from 'next/link'

import styles from './Footer.module.css';

const Footer = (props) => {

  let classes = [styles.Footer];
  classes.push(props.className);

  return (
    <footer className={classes.join(" ")}>
      A project by <a href="https://olivierbrueckner.de/">Olivier Brückner</a>
    </footer>
  )
}

export default Footer
