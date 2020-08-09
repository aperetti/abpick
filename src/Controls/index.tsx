import React, { PropsWithChildren, useRef, ChangeEvent } from 'react';
import './index.css';
import Card from '../Card';
import { Icon, Popover, Menu, MenuItem, Toast } from '@blueprintjs/core';
import Compressor from 'compressorjs'
import postBoard from '../api/postBoard'
import Toaster from '../Toaster'
interface Props {
  undoPick: () => void
  toggleEditMode: () => void
  editMode: boolean
  pickHistory: number[]
  randomizeBoard: () => void
  handleBoardResults: (results: Array<number>) => void
}

const handleUpload = (handleBoardResults: (results: Array<number>) => void) => (evt: ChangeEvent<HTMLInputElement>) => {
  if (!evt.target.files)
    return
  
  Toaster.show({ icon: 'cloud-upload', message: "Uploading file...", intent: 'none' }, 'upload')
  const file = evt.target.files[0]
  new Compressor(file, {
    quality: 0.6,
    async success(result: File) {
      const formData = new FormData();

      formData.append('file', result, result.name);
      const res = await postBoard(formData)
      if (res.result) {
        handleBoardResults(res.result)
        Toaster.dismiss('upload')
        Toaster.show({ icon: 'confirm', message: "Upload success! Loading skills now!", timeout: 2000})
      }
      if (res.error) {
        Toaster.dismiss('upload')
        Toaster.show({ icon: 'error', message: res.error, intent: 'danger' })
      }
    },
    error(err) {
      console.log(err.message);
    },
  })
}

function Controls(props: PropsWithChildren<Props>) {
  let { undoPick, pickHistory, editMode, toggleEditMode, randomizeBoard, handleBoardResults } = props
  const uploadRef = useRef<HTMLInputElement>(null)
  return (
    <div className='Controls-container'>
      <input ref={uploadRef} id="uploader" type='file' hidden onChange={handleUpload(handleBoardResults)} accept="image/*" />
      <Card title="Controls">
        <div className='Controls-actions'>
          <div onClick={() => undoPick()} className={`${pickHistory.length > 0 ? 'Controls-action' : 'Controls-action-disabled'}`}>
            <Icon color={`${pickHistory.length > 0 ? 'darkgrey' : 'var(--bg-dark)'}`} iconSize={40} icon='undo' />
          </div>
          <div onClick={() => toggleEditMode()} className={`${editMode ? 'Controls-action-active' : ''} Controls-action`}>
            <Icon color={`${editMode ? 'darkgrey' : 'var(--bg-dark)'}`} iconSize={40} icon='edit' />
          </div>
          <Popover
            className='Controls-action'
            target={
              <Icon color={'var(--bg-dark'} iconSize={40} icon='settings' />
            }
            content={
              <Menu>
                <MenuItem icon="random" label="Randomize Board" onClick={randomizeBoard} />
                <MenuItem icon="cloud-upload" label="Upload Draft Board" onClick={() => uploadRef.current?.click()} />
              </Menu>
            }
          />
        </div>
      </Card>
    </div>
  );
}

export default Controls;
