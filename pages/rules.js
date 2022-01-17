// React
import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import Link from 'next/link'

// Components
import Head from '../components/Head'
import Footer from '../components/Footer'

import styles from './index.module.css'

import rulesMD from './Rules.md'

let transformObjectArray = (val) => {

  let objectString = val.replace(/(\r\n|\n|\r)/gm, "");
  let newJson = objectString.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
  newJson = newJson.replace(/'/g, '"');
  let data = JSON.parse(newJson);

  return data;
}

const Home = () => {

  const [showRules, setShowRules] = useState(false);

  let classes = [styles.RulesPage];

  const ImgRenderer = props => {
    // console.log(props)
    return <img alt={props.alt} src={'/rulesImages/'+props.src} />
  }

  const codeRenderer = props => {

    switch (props.language){

      case 'colors':

        let colors =  transformObjectArray( props.value );

        let colorLegend = colors.map( (c,k)=>{
          return <li key={'colorLegend-'+k}>
            <span style={{background: c.color }}></span>
            <div className={styles.RulesLegendInfo}>
              <h6>
                {c.type}
              </h6>
            </div>
          </li>
        } )

        return(
          <ul className={styles.RulesLegend}>
            {colorLegend}
          </ul>
        )

        break;
      default:
        return null;
        break;
    }
  }

  return (
    <div className={classes.join(' ')}>

      <Head title="Kaboom — Rules" />

      <Link href="/">
        <a className={styles.button}>
          ↩ Back to the game
        </a>
      </Link>

      <ReactMarkdown
        plugins={[gfm]}
        source={rulesMD}
        className={styles.Rules}
        renderers={{
          image: ImgRenderer,
          code: codeRenderer
        }} />

      <Footer />

    </div>
  )
}

export default Home
