import { inlineCode } from 'discord.js';
import * as emoji from '@templates/emoji.js';
import { cpus as _cpus, totalmem, freemem, uptime } from 'node:os';
import { logFailure } from '@modules/logger.js';

const usageBenchmark = [
    { threshold: 0, status: 'excellent' },
    { threshold: 20, status: 'good' },
    { threshold: 40, status: 'okay' },
    { threshold: 60, status: 'sluggish' },
    { threshold: 80, status: 'very bad' }
]

type CPUBenchmarkResult = {
    total: number,
    sys: number,
    user: number
}

type CPUBenchmarkStringResult = {
    ['system']: string,
    ['user']: string
}

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
function getCpuUsage(delayMs = 500): Promise<CPUBenchmarkStringResult> {
    const sample = (): CPUBenchmarkResult => {
        const cpus = _cpus();
        let total = 0;
        let sys = 0;
        let user = 0;

        for (const cpu of cpus) {
            for (const time in Object.values(cpu.times)) {
                total += Number(time);
            }
            sys += cpu.times.sys;
            user += cpu.times.user;
        }

        return {
            total: total / cpus.length,
            sys: sys / cpus.length,
            user: user / cpus.length
        };
    };

    const start = sample();
    return new Promise((resolve) => {
        setTimeout(() => {
            const end = sample();

            const totalDifference = end.total - start.total;

            if (totalDifference === 0) {
                return resolve({
                    ['system']: '0%',
                    ['user']: '0%'}
                )};

            resolve({
                ['system']: formatPercent((end.sys - start.sys) / totalDifference), ['user']: formatPercent((end.user - start.user) / totalDifference)
            });
        }, delayMs);
    });
}

async function getMemoryUsage() {
    const maxMemory = totalmem();
    const freeMemory = freemem();
    const usedMemory = maxMemory - freeMemory

    return { usedMemory, maxMemory }
}

function formatMemoryUsage(usedMemory: number, maxMemory: number) {
    const barEmoji = emoji.LOAD.BAR
    const barLength = 5;
    const bytesToGiB = 1024 ** 3;

    const maxGiBMemory = (maxMemory / bytesToGiB).toFixed(2);
    const usedGiBMemory = (usedMemory / bytesToGiB).toFixed(2);

    const percentage = maxMemory > 0 ? Math.min(1, Math.max(0, usedMemory / maxMemory)) : 0;

    const totalFilled = Math.round(percentage * barLength);
    const barStart = totalFilled > 0 ? barEmoji.FG.start : barEmoji.BG.start;
    const midCapacity = Math.max(0, barLength - 2);
    const filledMid = Math.min(midCapacity, Math.max(0, totalFilled - 1));
    const emptyMid = midCapacity - filledMid;
    const barMid = emoji.LOAD.BAR.BG.mid.repeat(filledMid) + barEmoji.BG.mid.repeat(emptyMid);
    const barEnd = totalFilled === barLength ? barEmoji.FG.end : barEmoji.BG.end;

    const informationSection = `[${usedGiBMemory}gb/${maxGiBMemory}gb]`
    return `${barStart}${barMid}${barEnd} ${inlineCode(informationSection)}`
}

async function getUptime() {
    const baseUptime = uptime();
    const daysUptime = Math.round((baseUptime) / (3_600 * 24)).toString().padStart(2, '0')
    const hoursUptime = Math.round((baseUptime % (3_600 * 24)) / 3_600).toString().padStart(2, '0')
    const minutesUptime = Math.round((baseUptime % 3_600) / 60).toString().padStart(2, '0')
    const secondsUptime = Math.round(baseUptime % 60).toString().padStart(2, '0')

    return { daysUptime, hoursUptime, minutesUptime, secondsUptime }
}

function getBenchmarkStatus(percentageString: string) {
    const numericValue = parseInt(percentageString, 10);
    const match = usageBenchmark.find(item => numericValue >= item.threshold);
    return match ? match.status : "Unknown";
}

async function generateRundown() {
    try {
        const { user: cpuUsageUser, system: cpuUsageSystem } = await getCpuUsage();
        const uptimeObjects = await getUptime();
        const { usedMemory, maxMemory } = await getMemoryUsage();

        const cpuBenchmarkSystem = getBenchmarkStatus(cpuUsageSystem);
        const cpuBenchmarkUser = getBenchmarkStatus(cpuUsageUser);
        const legibleUptime = Object.values(uptimeObjects).join(':');
        const legibleMemoryUsage = formatMemoryUsage(usedMemory, maxMemory);

        return `system cpu usage: ${inlineCode(cpuUsageSystem)} (${cpuBenchmarkSystem})
user cpu usage: ${inlineCode(cpuUsageUser)} (${cpuBenchmarkUser})
memory usage: ${legibleMemoryUsage}
uptime: ${inlineCode(legibleUptime)}`;

    } catch (error) {
        logFailure(`Error generating server rundown because: ${error}`);
        return 'something went wrong!';
    }
}

export { usageBenchmark, generateRundown, formatPercent, getCpuUsage, getMemoryUsage, formatMemoryUsage, getUptime, getBenchmarkStatus }