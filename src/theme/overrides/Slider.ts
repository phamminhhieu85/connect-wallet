import { Theme } from '@mui/material';

// ----------------------------------------------------------------------

export default function Slider(theme: Theme) {
	const isLight = theme.palette.mode === 'light';

	return {
		MuiSlider: {
			styleOverrides: {
				root: {
					'&.Mui-disabled': {
						color: theme.palette.action.disabled,
					},
				},
				markLabel: {
					fontSize: 13,
					color: theme.palette.text.disabled,
				},
				valueLabel: {
					borderRadius: 8,
					backgroundColor: theme.palette.grey[isLight ? 800 : 700],
				},
			},
		},
	};
}
