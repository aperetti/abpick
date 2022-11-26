import React, { PropsWithChildren } from 'react';
import { RecPick, SkillDict } from '../App';
import SkillImage from '../SkillImage';
import Card from '../Card'
import './index.css';
import { Popover2 } from '@blueprintjs/popover2';
import { DARK } from '@blueprintjs/core/lib/esm/common/classes';
import { SkillDetail, SkillDetailGroup } from '../SkillDetails';

interface Props {
  skillDict: SkillDict
  rec: RecPick
}

function RecSkill({skillDict, rec}: PropsWithChildren<Props>) {
  return (
    <>
      <Popover2
        interactionKind='hover'
        placement='top'
        popoverClassName={DARK}
        content={
          <Card title="Details">
            <div style={{padding: "10px"}}>
              <SkillDetailGroup>
                {rec.details?.map(recDetail => {
                return <SkillDetail desc={recDetail.label}>{recDetail.score > 0 ? "+" : "-"}{(recDetail.score * 100).toFixed(0)}</SkillDetail>
              })
              }
              </SkillDetailGroup>
            </div>
          </Card>
        }>
        <div>
            <SkillImage small skill={skillDict[rec.skill]} synergy={rec.bonus} showPick disableAgs />
        </div>
      </Popover2>
    </>
  );
}

export default RecSkill
