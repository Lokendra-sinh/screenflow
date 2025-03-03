import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { Clock, Monitor, Globe, Activity } from 'lucide-react';

const TimeDistribution = ({ timeData }) => {
  // If no data is provided, use sample data
  const data = timeData || {
    byApp: [
      {
        app: "Visual Studio Code",
        percentage: 43,
        totalDuration: 45000
      },
      {
        app: "Google Chrome",
        percentage: 57,
        totalDuration: 60000
      }
    ],
    byDomain: [
      {
        domain: "localhost:3000",
        percentage: 10,
        totalDuration: 10000
      },
      {
        domain: "x.com",
        percentage: 47,
        totalDuration: 50000
      }
    ],
    byType: [
      {
        percentage: 43,
        totalDuration: 45000,
        type: "technical-documentation"
      },
      {
        percentage: 57,
        totalDuration: 60000,
        type: "social-media"
      }
    ]
  };

  // Format durations from milliseconds to minutes and seconds
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Colors for charts
  const chartColors = {
    productive: "#10b981",
    nonProductive: "#6ee7b7",
    neutral: "#34d399"
  };

  // Determine color based on activity type
  const getActivityColor = (type) => {
    if (type === "technical-documentation") return chartColors.productive;
    if (type === "social-media") return chartColors.nonProductive;
    return chartColors.neutral;
  };

  // Generate data for the pie charts
  const prepareDataForPieChart = (data, nameKey) => {
    return data.map(item => ({
      name: item[nameKey],
      value: item.percentage,
      duration: formatDuration(item.totalDuration)
    }));
  };

  const appData = prepareDataForPieChart(data.byApp, 'app');
  const domainData = prepareDataForPieChart(data.byDomain, 'domain');
  const typeData = prepareDataForPieChart(data.byType, 'type');

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-emerald-100 rounded-md shadow-sm">
          <p className="font-medium text-emerald-800">{payload[0].name}</p>
          <p className="text-emerald-600">{payload[0].payload.duration}</p>
          <p className="text-emerald-700 font-bold">{payload[0].value}% of time</p>
        </div>
      );
    }
    return null;
  };

  // Render time distribution bar for a pair of values (simple visual)
  const SimpleTimeBar = ({ data, nameKey, colorKey = 'type' }) => {
    return (
      <div className="mt-6">
        {data.map((item, index) => (
          <div key={index} className="mb-6">
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getActivityColor(item[colorKey]) }}></div>
                <span className="font-medium text-emerald-800">{item[nameKey]}</span>
              </div>
              <span className="text-emerald-700 font-bold">{item.percentage}%</span>
            </div>
            <div className="relative h-6 bg-emerald-100 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full rounded-full" 
                style={{ 
                  width: `${item.percentage}%`, 
                  backgroundColor: getActivityColor(item[colorKey])
                }}
              ></div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-medium text-emerald-800">
                {formatDuration(item.totalDuration)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">How You Spent Your Time</h2>
        <p className="text-emerald-600">Clear breakdown of your time across apps, websites, and activities</p>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="mb-6 w-full bg-emerald-100 p-1">
          <TabsTrigger value="visual" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-emerald-800">
            Visual View
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-emerald-800">
            Detailed View
          </TabsTrigger>
        </TabsList>

        {/* Simple Visual View - For quick understanding */}
        <TabsContent value="visual" className="space-y-6">
          <Card className="border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 flex items-center">
                <Activity className="mr-2 h-5 w-5" /> Activity Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="h-12 rounded-full bg-emerald-100 relative overflow-hidden">
                    {data.byType.map((item, index, arr) => {
                      // Calculate width percentage
                      const width = item.percentage;
                      
                      // Calculate left position based on previous items
                      let leftPosition = 0;
                      for (let i = 0; i < index; i++) {
                        leftPosition += arr[i].percentage;
                      }
                      
                      return (
                        <div 
                          key={index}
                          className="absolute top-0 h-full flex items-center justify-center"
                          style={{ 
                            width: `${width}%`, 
                            left: `${leftPosition}%`,
                            backgroundColor: getActivityColor(item.type)
                          }}
                        >
                          <span className="text-white font-bold text-sm px-2 whitespace-nowrap">
                            {item.percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    {data.byType.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="flex items-center mb-1">
                          <div 
                            className="w-3 h-3 rounded-full mr-1"
                            style={{ backgroundColor: getActivityColor(item.type) }}
                          ></div>
                          <span className="text-sm font-medium capitalize">
                            {item.type.replace(/-/g, ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-600">{formatDuration(item.totalDuration)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-emerald-800 flex items-center mb-4">
                    <Monitor className="mr-2 h-5 w-5" /> Applications
                  </h3>
                  <SimpleTimeBar data={data.byApp} nameKey="app" colorKey="app" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-emerald-800 flex items-center mb-4">
                    <Globe className="mr-2 h-5 w-5" /> Websites
                  </h3>
                  <SimpleTimeBar data={data.byDomain} nameKey="domain" colorKey="domain" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Time Comparison Card */}
          <Card className="border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 flex items-center">
                <Clock className="mr-2 h-5 w-5" /> Time Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.byApp.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-emerald-100">
                    <h4 className="font-medium text-emerald-700 mb-2">{item.app}</h4>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold text-emerald-800">{item.percentage}%</div>
                      <div className="text-sm text-emerald-600">{formatDuration(item.totalDuration)}</div>
                    </div>
                    
                    <div className="mt-2 h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${item.percentage}%`, 
                          backgroundColor: item.app === "Visual Studio Code" ? chartColors.productive : chartColors.nonProductive 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {data.byDomain.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-emerald-100">
                    <h4 className="font-medium text-emerald-700 mb-2">{item.domain}</h4>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold text-emerald-800">{item.percentage}%</div>
                      <div className="text-sm text-emerald-600">{formatDuration(item.totalDuration)}</div>
                    </div>
                    
                    <div className="mt-2 h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${item.percentage}%`, 
                          backgroundColor: item.domain === "localhost:3000" ? chartColors.productive : chartColors.nonProductive 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed View - For more information */}
        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Applications */}
            <Card className="border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-800 flex items-center">
                  <Monitor className="mr-2 h-5 w-5" /> Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={appData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {appData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === "Visual Studio Code" ? chartColors.productive : chartColors.nonProductive} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  {data.byApp.map((item, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ 
                            backgroundColor: item.app === "Visual Studio Code" ? chartColors.productive : chartColors.nonProductive 
                          }}
                        ></div>
                        <span className="text-sm">{item.app}</span>
                      </div>
                      <span className="font-medium">{formatDuration(item.totalDuration)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Domains/Websites */}
            <Card className="border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-800 flex items-center">
                  <Globe className="mr-2 h-5 w-5" /> Websites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={domainData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {domainData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === "localhost:3000" ? chartColors.productive : chartColors.nonProductive} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  {data.byDomain.map((item, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ 
                            backgroundColor: item.domain === "localhost:3000" ? chartColors.productive : chartColors.nonProductive 
                          }}
                        ></div>
                        <span className="text-sm">{item.domain}</span>
                      </div>
                      <span className="font-medium">{formatDuration(item.totalDuration)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Activity Type */}
            <Card className="border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-800 flex items-center">
                  <Activity className="mr-2 h-5 w-5" /> Activity Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {typeData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getActivityColor(data.byType[index].type)} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  {data.byType.map((item, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getActivityColor(item.type) }}
                        ></div>
                        <span className="text-sm capitalize">{item.type.replace(/-/g, ' ')}</span>
                      </div>
                      <span className="font-medium">{formatDuration(item.totalDuration)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart Comparison */}
          <Card className="border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800">Time Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      ...data.byApp.map(item => ({
                        name: item.app,
                        value: item.totalDuration / 1000 / 60, // Convert to minutes
                        category: 'Applications',
                        percentage: item.percentage
                      })),
                      ...data.byDomain.map(item => ({
                        name: item.domain,
                        value: item.totalDuration / 1000 / 60, // Convert to minutes
                        category: 'Websites',
                        percentage: item.percentage
                      })),
                      ...data.byType.map(item => ({
                        name: item.type.replace(/-/g, ' '),
                        value: item.totalDuration / 1000 / 60, // Convert to minutes
                        category: 'Activity Types',
                        percentage: item.percentage
                      }))
                    ]}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" scale="band" />
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} min (${props.payload.percentage}%)`, 'Time Spent']}
                      labelFormatter={(value) => `${value}`}
                    />
                    <Bar dataKey="value" name="Minutes">
                      {data.byApp.concat(data.byDomain).concat(data.byType).map((entry, index) => {
                        let color;
                        if (index < data.byApp.length) {
                          color = entry.app === "Visual Studio Code" ? chartColors.productive : chartColors.nonProductive;
                        } else if (index < data.byApp.length + data.byDomain.length) {
                          const domainItem = data.byDomain[index - data.byApp.length];
                          color = domainItem.domain === "localhost:3000" ? chartColors.productive : chartColors.nonProductive;
                        } else {
                          const typeItem = data.byType[index - data.byApp.length - data.byDomain.length];
                          color = getActivityColor(typeItem.type);
                        }
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeDistribution;