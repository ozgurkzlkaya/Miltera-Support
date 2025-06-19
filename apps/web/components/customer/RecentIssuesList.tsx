"use client";

import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Box,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Assignment as IssueIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Visibility as ViewIcon,
  Phone as CallIcon,
} from "@mui/icons-material";

interface Issue {
  id: string;
  product: string;
  serialNumber: string;
  description: string;
  status: string;
  priority: string;
  createdDate: string;
  estimatedCompletion?: string;
  assignedTechnician: string;
}

interface RecentIssuesListProps {
  issues: Issue[];
  onCreateNew: () => void;
  onViewAll: () => void;
  onViewIssue?: (issueId: string) => void;
  onContactTechnician?: (issueId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "success";
    case "In Progress":
      return "warning";
    case "Pending":
      return "default";
    default:
      return "default";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
    case "Critical":
      return "error";
    case "Medium":
      return "warning";
    case "Low":
      return "info";
    default:
      return "default";
  }
};

export const RecentIssuesList = ({ 
  issues, 
  onCreateNew, 
  onViewAll,
  onViewIssue,
  onContactTechnician 
}: RecentIssuesListProps) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Son Arıza Kayıtları
          </Typography>
        </Box>

        {issues.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <IssueIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Henüz arıza kaydınız bulunmuyor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ürünlerinizle ilgili bir sorun yaşadığınızda buradan arıza kaydı oluşturabilirsiniz.
            </Typography>
          </Box>
        ) : (
          <List>
            {issues.map((issue, index) => (
              <Box key={issue.id}>
                <ListItem sx={{ px: 0, alignItems: "flex-start" }}>
                  <ListItemIcon sx={{ mt: 1 }}>
                    {issue.status === "Completed" ? (
                      <CompletedIcon color="success" />
                    ) : issue.status === "In Progress" ? (
                      <PendingIcon color="warning" />
                    ) : (
                      <IssueIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                        <Typography variant="subtitle2" component="div" sx={{ mb: 0.5, fontWeight: 600 }}>
                          {issue.product} - {issue.id}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                          <Chip
                            label={issue.status}
                            size="small"
                            color={getStatusColor(issue.status) as any}
                          />
                          <Chip
                            label={issue.priority}
                            size="small"
                            color={getPriorityColor(issue.priority) as any}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {onViewIssue && (
                          <Tooltip title="Detayları Görüntüle">
                            <IconButton 
                              size="small" 
                              onClick={() => onViewIssue(issue.id)}
                              sx={{ "&:hover": { backgroundColor: "primary.light", color: "white" } }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onContactTechnician && issue.status === "In Progress" && (
                          <Tooltip title="Teknisyen ile İletişim">
                            <IconButton 
                              size="small" 
                              onClick={() => onContactTechnician(issue.id)}
                              sx={{ "&:hover": { backgroundColor: "success.light", color: "white" } }}
                            >
                              <CallIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {issue.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Seri No: {issue.serialNumber} | Teknisyen: {issue.assignedTechnician}
                    </Typography>
                    {issue.status === "In Progress" && issue.estimatedCompletion && (
                      <Typography variant="caption" color="primary" sx={{ display: "block" }}>
                        Tahmini Tamamlanma: {new Date(issue.estimatedCompletion).toLocaleDateString("tr-TR")}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
                {index < issues.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" variant="text" onClick={onViewAll}>
          Tüm Arıza Kayıtlarını Görüntüle
        </Button>
      </CardActions>
    </Card>
  );
}; 