import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function ClearDataAlertDialog({ removeVodData, refresh }: { removeVodData: () => void, refresh: () => void }) {

  function handleClear() {
    removeVodData()
    setTimeout(refresh, 100)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="text-primary/60 text-right hover:text-primary cursor-pointer mt-2">Clear data</div>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-none bg-primary-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will erase all related data like where you stopped watching and favorite.
          </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-none shadow-none">Cancel</AlertDialogCancel>
          <AlertDialogAction className="border-none shadow-none" onClick={handleClear}>Clear</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}