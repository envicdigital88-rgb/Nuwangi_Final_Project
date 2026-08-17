import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Dummy data for Sales over time
const salesData = [
  { month: 'Jan', sales: 4000, users: 2400 },
  { month: 'Feb', sales: 3000, users: 1398 },
  { month: 'Mar', sales: 2000, users: 9800 },
  { month: 'Apr', sales: 2780, users: 3908 },
  { month: 'May', sales: 1890, users: 4800 },
  { month: 'Jun', sales: 2390, users: 3800 },
  { month: 'Jul', sales: 3490, users: 4300 },
];

// Dummy data for AI Size Recommendations
const sizeRecommendationsData = [
  { size: 'XS', count: 150 },
  { size: 'S', count: 800 },
  { size: 'M', count: 1200 },
  { size: 'L', count: 950 },
  { size: 'XL', count: 400 },
  { size: 'XXL', count: 120 },
];

// Dummy data for Return Rates by Reason
const returnReasonData = [
  { name: 'Fit Issue (Too Small)', value: 400 },
  { name: 'Fit Issue (Too Big)', value: 300 },
  { name: 'Style / Preference', value: 300 },
  { name: 'Damaged Item', value: 200 },
];

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981'];

const AnalyticsPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'text.primary' }}>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase">
              Total Revenue
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#10b981' }}>
              $45,231
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              +14% this month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase">
              AI Try-On Sessions
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#3b82f6' }}>
              12,450
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              +22% this month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase">
              Return Rate (Post-AI)
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#ef4444' }}>
              8.4%
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              -4.2% since launch
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" textTransform="uppercase">
              AI Prediction Accuracy
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: '#8b5cf6' }}>
              94.2%
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Based on user feedback
            </Typography>
          </Paper>
        </Grid>

        {/* Sales Over Time Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Revenue & Traffic Overview
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="sales" name="Sales ($)" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="users" name="Active Users" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Returns by Reason Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Return Reasons Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={returnReasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {returnReasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* AI Size Recommendations Bar Chart */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              AI Size Recommendations Distribution
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
              Frequency of sizes predicted by the Random Forest ML Model this month.
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={sizeRecommendationsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="size" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Bar dataKey="count" name="Times Recommended" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
