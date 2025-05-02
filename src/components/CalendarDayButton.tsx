import type React from 'react';
import { getDayColorBySymptomLevel } from '@/lib/utils';

type Medication = 'Bilaxten' | 'Relvar' | 'Ventolin' | 'Dymista';

type Props = {
	date: Date;
	dayData:
		| {
				date: string;
				symptomLevel: string | null;
				medications: Medication[];
		  }
		| undefined;
	onClick: (date: Date) => void;
};

export const CalendarDayButton: React.FC<Props> = ({
	date,
	dayData,
	onClick,
}) => {
	const dayColor = getDayColorBySymptomLevel(dayData?.symptomLevel);
	const dayMeds = dayData?.medications || [];

	return (
		<button
			onClick={() => onClick(date)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onClick(date);
				}
			}}
			className={`relative cursor-pointer rounded-md flex flex-col items-center p-1 font-normal aria-selected:opacity-100 ${dayColor} min-h-[70px] min-w-[70px]`}
			type="button"
		>
			<span className="font-medium mb-1">{date.getDate()}</span>
			{dayMeds.length > 0 && (
				<div className="flex flex-col gap-1 justify-center items-center">
					{/* Dividir los medicamentos en dos filas de máximo 2 elementos cada una */}
					<div className="flex gap-1 justify-center">
						{dayMeds.slice(0, 2).map((med) => (
							<span
								key={med}
								className={
									med === 'Bilaxten'
										? 'text-[10px] px-1 bg-blue-100 font-semibold rounded-sm'
										: med === 'Relvar'
											? 'text-[10px] px-1 bg-purple-100 font-semibold rounded-sm'
											: med === 'Ventolin'
												? 'text-[10px] px-1 bg-teal-100 font-semibold rounded-sm'
												: 'text-[10px] px-1 bg-pink-100 font-semibold rounded-sm'
								}
								title={med}
							>
								{med[0]}
							</span>
						))}
					</div>
					{dayMeds.length > 2 && (
						<div className="flex gap-1 justify-center mt-1">
							{dayMeds.slice(2, 4).map((med) => (
								<span
									key={med}
									className={
										med === 'Bilaxten'
											? 'text-[10px] px-1 bg-blue-100 font-semibold rounded-sm'
											: med === 'Relvar'
												? 'text-[10px] px-1 bg-purple-100 font-semibold rounded-sm'
												: med === 'Ventolin'
													? 'text-[10px] px-1 bg-teal-100 font-semibold rounded-sm'
													: 'text-[10px] px-1 bg-pink-100 font-semibold rounded-sm'
									}
									title={med}
								>
									{med[0]}
								</span>
							))}
						</div>
					)}
				</div>
			)}
		</button>
	);
};
