import React, { useState, useMemo } from 'react';
import { useAccount, useContractWrite } from '@starknet-react/core';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const CELL_MINT_PRICE = 0.001;
interface CellProps {
  row: number;
  col: number;
  isSelected: boolean;
  handleMouseDown: (row: number, col: number) => void;
  handleMouseEnter: (row: number, col: number) => void;
}

interface MatrixState {
  isSelecting: boolean;
  startCell: { row: number; col: number };
  selectedCells: { row: number; col: number }[];
  showPopup: boolean;
  mintPrice: number | undefined;
}

const Cell: React.FC<CellProps> = ({ row, col, isSelected, handleMouseDown, handleMouseEnter }) => {
  return (
    <div
      style={{
        width: '10px',
        height: '10px',
        backgroundColor: isSelected ? 'yellow' : '#f0f0f0',
        border: '1px solid black',
      }}
      onMouseDown={() => handleMouseDown(row, col)}
      onMouseEnter={() => handleMouseEnter(row, col)}
    ></div>
  );
};

const Matrix: React.FC = () => {
  const totalRows = 100;
  const totalCols = 100;
  const [state, setState] = useState<MatrixState>({
    isSelecting: false,
    startCell: { row: 0, col: 0 },
    selectedCells: [],
    showPopup: false,
    mintPrice: undefined,
  });
  const { address } = useAccount();
  const calls = useMemo(() => {
    const tx = {
      contractAddress: '0x05eefcf9148636f2f0f3b7969e7d0107809ee05201ecbbd69335c40bd031de75',
      entrypoint: 'mint2',
      calldata: [address!, 1, 1, 2, 2, ['http://sitio.com/a.jpg'], ['http://sitio.com/']],
    };
    return tx;
  }, [address]);

  const { write } = useContractWrite({ calls });

  const { isSelecting, startCell, selectedCells, mintPrice, showPopup } = state;

  const handleMouseDown = (row: number, col: number): void => {
    setState((prevState) => ({
      ...prevState,
      isSelecting: true,
      startCell: { row, col },
      selectedCells: [{ row, col }],
    }));
  };

  const handleMouseUp = (): void => {
    if (isSelecting) {
      setState((prevState) => ({
        ...prevState,
        isSelecting: false,
        showPopup: selectedCells.length >= 1,
      }));
    }
  };

  const handleMouseEnter = (row: number, col: number): void => {
    if (isSelecting) {
      const newSelectedCells: any[] = [];
      for (let r = Math.min(startCell.row, row); r <= Math.max(startCell.row, row); r++) {
        for (let c = Math.min(startCell.col, col); c <= Math.max(startCell.col, col); c++) {
          newSelectedCells.push({ row: r, col: c });
        }
      }
      setState((prevState) => ({
        ...prevState,
        selectedCells: newSelectedCells,
        mintPrice: newSelectedCells.length * CELL_MINT_PRICE
      }));
    }
  };

  const handleMintClick = (): void => {
    console.log('Mint NFT for selected cells');
    write();
    setState((prevState) => ({
      ...prevState,
      showPopup: false,
      selectedCells: [],
      mintPrice: undefined,
    }));
  };

  const handleClosePopup = (): void => {
    setState((prevState) => ({
      ...prevState,
      showPopup: false,
      selectedCells: [],
    }));
  };

  return (
    <div style={{ width: 'auto', height: '100vh', cursor: 'cell', padding: 'inherit', display: 'inline' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${totalCols}, 10px)`,
          justifyContent: 'center',
        }}
        onMouseUp={handleMouseUp}
      >
        {Array.from({ length: totalRows }).map((_, row) =>
          Array.from({ length: totalCols }).map((_, col) => (
            <Cell
              key={`${row},${col}`}
              row={row}
              col={col}
              isSelected={selectedCells.some((cell) => cell.row === row && cell.col === col)}
              handleMouseDown={handleMouseDown}
              handleMouseEnter={handleMouseEnter}
            />
          ))
        )}
      </div>

      <Modal
        open={showPopup}
        onClose={handleClosePopup}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            p: 3,
          }}
        >
          <Typography variant="h5">Mint NFT</Typography>
          <Typography>
            Price: {mintPrice} ETH for {selectedCells.length} cells
          </Typography>
          <Button onClick={handleMintClick}>Mint</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Matrix;
