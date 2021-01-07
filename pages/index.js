// React
import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'


// Components
import Head from '../components/Head'
import Footer from '../components/Footer'

import Game from '../components/Kaboom/Game'

import styles from './index.module.css'

import rulesMD from './Rules.md'

const Home = () => {

  const [showRules, setShowRules] = useState(false);

  let classes = [styles.Home];

  const ImgRenderer = props => {
    console.log(props)
    return <img alt={props.alt} src={'/rulesImages/'+props.src} />
  }

  if( showRules ){
    classes.push( styles.showRules );
  }

  return (
    <div className={classes.join(' ')}>

      <Head title="Kaboom" />

      <div className={styles.GameContainer}>
        <Game />
      </div>

      <div className={styles.RulesContainer}>
        <ReactMarkdown
          plugins={[gfm]}
          source={rulesMD}
          className={styles.Rules}
          renderers={{image: ImgRenderer}} />
      </div>

      <div className={styles.toggleRulesBtn} onClick={ ()=>{ setShowRules(!showRules) } }>
        {showRules ? 'Hide' : 'Show'} Rules
      </div>

    </div>
  )
}

export default Home
